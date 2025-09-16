import { Ollama } from "ollama";
import readline from "node:readline";
const MODEL = "gpt-oss:20b";
const TOTAL_QUESTIONS = 3;
const ollama = new Ollama();

const QUESTION_INSTRUCTION = `create an instruction for the model to generate a trivia question`;

const QUESTION_PROMPT = (previous) => {
  return `create a prompt to instruct the model to generate a trivia question
  optionally including previous questions to avoid similar topics.`;
};

const EVALUATOR_INSTRUCTION = `
create an instruction for the model to evaluate a trivia answer`;

const EVALUATOR_PROMPT = (question, userAnswer) => {
  return `create a prompt to instruct the model to evaluate a trivia answer
  including the question and the user's answer.`;
};

// Task 1: fetch a trivia question from the model, suggestion for a prompt is in the readme
// documentation for ollama.chat: https://github.com/ollama/ollama-js
async function generateQuestion(previous) {
  // TODO: implement using ollama.chat()
  return "TODO: implement me";
}

// Task 2: evaluate the user's answer using ollama.chat.
// We instruct the model to respond with a JSON object like:
// {"correct": boolean, "shortFeedback": "one short sentence", "modelAnswer": "concise expected answer"}
// Documentation for ollama.chat: https://github.com/ollama/ollama-js
async function evaluateAnswer(question, userAnswer) {
  // TODO: implement using ollama.chat()
  return "TODO: implement me";
}

async function main() {
  console.log("\n=== Trivia Quiz (Exercise 1) ===");
  console.log("Model:", MODEL, "\n");

  let score = 0;
  const asked = [];

  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    console.log(`Question ${i}/${TOTAL_QUESTIONS}`);
    const question = await generateQuestion(asked);
    console.log(question);

    const answer = await askInput("Your answer: ");
    if (answer === undefined) {
      console.log("Aborted.");
      break;
    }

    const evalResult = await evaluateAnswer(question, answer);
    if (evalResult.correct) {
      score++;
      console.log("✔ Correct!");
    } else {
      console.log(
        "✖ Incorrect. Expected:",
        evalResult.modelAnswer || "(no answer)"
      );
    }
    asked.push(question);
  }

  console.log("Final Score:", score, "/", TOTAL_QUESTIONS);
  rl.close();
}

// Utility code (not part of the exercise tasks)
function askInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

main().catch((err) => {
  console.error("Unexpected error:", err);
  rl.close();
  process.exit(1);
});
