#!/usr/bin/env node
import prompts from "prompts";
import chalk from "chalk";
import { performance } from "node:perf_hooks";
import { TOTAL_QUESTIONS } from "./config.js";
import {
  chooseModel,
  intro,
  startSpinner,
  generateQuestion,
  evaluateAnswer,
  printSummary,
} from "./utils.js";

async function main() {
  const selectedModel = await chooseModel();
  intro(selectedModel);
  let score = 0;
  const details = [];
  const genLatencies = [];
  const asked = [];

  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const header = chalk.bold(`Question ${i}/${TOTAL_QUESTIONS}`);
    process.stdout.write(header + "\n");
    let stop = () => {};
    const t0 = performance.now();
    if (i === 1) {
      stop = startSpinner("Warming up model & generating first question...");
    }
    const questionObj = await generateQuestion(selectedModel, i, asked);
    const t = performance.now() - t0;
    if (i === 1) {
      stop();
      process.stdout.write("\r\x1b[2K");
      console.log(
        chalk.dim(`First question ready in ${(t / 1000).toFixed(2)}s`)
      );
    } else {
      process.stdout.write("\r");
      console.log(chalk.dim(`(generated in ${Math.round(t)} ms)`));
    }
    genLatencies.push(t);
    const { question } = questionObj;
    console.log(chalk.white(question));
    const { answer } = await prompts({
      type: "text",
      name: "answer",
      message: "Your answer:",
    });
    if (answer === undefined) {
      console.log(chalk.red("Game aborted."));
      process.exit(1);
    }
    if (!answer.trim()) {
      console.log(chalk.red("✖ Incorrect."), chalk.dim("No answer given"));
      console.log(chalk.dim("Expected answer:"), chalk.yellow(""));
      details.push({ question, answer, correct: false, modelAnswer: "" });
      console.log();
      continue;
    }
    const evaluation = await evaluateAnswer(selectedModel, question, answer);
    const { correct, shortFeedback, modelAnswer } = evaluation;
    if (correct) {
      score++;
      console.log(chalk.green("✔ Correct!"), chalk.dim(shortFeedback));
    } else {
      console.log(chalk.red("✖ Incorrect."), chalk.dim(shortFeedback));
      console.log(chalk.dim("Expected answer:"), chalk.yellow(modelAnswer));
    }
    details.push({ question, answer, correct, modelAnswer });
    asked.push(question);
    console.log();
  }

  printSummary(score, details, genLatencies);
}

main();
