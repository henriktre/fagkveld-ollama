import ollama from "ollama";
import chalk from "chalk";
import prompts from "prompts";
import {
  PROMPT_SYSTEM_QUESTION_BASE,
  PROMPT_USER_QUESTION,
  PROMPT_SYSTEM_EVAL,
  PROMPT_USER_EVAL,
} from "./prompts.js";
import { TOTAL_QUESTIONS, DEFAULT_MODEL } from "./config.js";

// Normalization helper
export function norm(q) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Generate a trivia question with retry and de-dup logic
export async function generateQuestion(model, n, previous) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await ollama.chat({
      model,
      messages: [
        { role: "system", content: PROMPT_SYSTEM_QUESTION_BASE },
        { role: "user", content: PROMPT_USER_QUESTION(n, previous) },
      ],
      options: { temperature: attempt === 0 ? 0.55 : 0.75 },
    });
    let raw = res.message.content.trim().replace(/^"|"$/g, "");
    raw = raw.replace(/^(?:Q(?:uestion)?\s*\d+[:.)-]\s*)/i, "").trim();
    if (!raw.endsWith("?")) {
      const idx = raw.lastIndexOf("?");
      if (idx !== -1) raw = raw.slice(0, idx + 1);
    }
    if (!raw) continue;
    if (!previous.some((p) => norm(p) === norm(raw))) return { question: raw };
  }
  const res = await ollama.chat({
    model,
    messages: [
      { role: "system", content: PROMPT_SYSTEM_QUESTION_BASE },
      { role: "user", content: PROMPT_USER_QUESTION(n, previous) },
    ],
    options: { temperature: 0.85 },
  });
  let raw = res.message.content.trim().replace(/^"|"$/g, "");
  return { question: raw || "Trivia question?" };
}

// Evaluate an answer, tolerant JSON extraction
export async function evaluateAnswer(model, question, answer) {
  const res = await ollama.chat({
    model,
    messages: [
      { role: "system", content: PROMPT_SYSTEM_EVAL },
      { role: "user", content: PROMPT_USER_EVAL(question, answer) },
    ],
    options: { temperature: 0 },
  });
  const raw = res.message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed = { correct: false, shortFeedback: "", modelAnswer: "" };
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
      if (
        parsed &&
        (parsed.modelAnswer === undefined || parsed.modelAnswer === null)
      ) {
        parsed.modelAnswer = "";
      }
    } catch (e) {
      // keep defaults
    }
  }
  return parsed;
}

// Intro display
export function intro(selectedModel) {
  console.log(chalk.bold.cyan("\nOllama Trivia Challenge"));
  console.log(chalk.dim("Model:"), selectedModel);
  console.log("\nYou will be asked " + TOTAL_QUESTIONS + " trivia questions.");
  console.log("Type your best answer and press Enter.");
  console.log(
    "Scoring: Each correct answer = 1 point. Partial answers may be marked incorrect."
  );
  console.log(chalk.yellow("\nLet's begin!\n"));
}

// Spinner factory
export function startSpinner(text) {
  let i = 0;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  process.stdout.write(text);
  const id = setInterval(() => {
    process.stdout.write(
      "\r" + chalk.blue(frames[(i = ++i % frames.length)]) + " " + text
    );
  }, 80);
  return () => {
    clearInterval(id);
    process.stdout.write("\r");
  };
}

// Model listing
export async function listLocalModels() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    const models = (data.models || [])
      .map((m) => m.name)
      .filter(Boolean)
      .sort();
    return models;
  } catch (e) {
    return [];
  }
}

// Model selection with interactive prompt fallback
export async function chooseModel() {
  const models = await listLocalModels();
  if (models.length === 0) {
    console.log(
      chalk.yellow("Could not list local models; using default:"),
      DEFAULT_MODEL
    );
    return DEFAULT_MODEL;
  }
  if (!models.includes(DEFAULT_MODEL)) {
    models.unshift(
      DEFAULT_MODEL + " (pull with: ollama pull " + DEFAULT_MODEL + ")"
    );
  }
  if (models.length === 1) {
    console.log(
      chalk.dim("Only one model detected, auto-selecting:"),
      models[0]
    );
    return models[0];
  }
  const { model } = await prompts({
    type: "select",
    name: "model",
    message: "Select Ollama model",
    choices: models.map((m) => ({ title: m, value: m.split(" ")[0] })),
  });
  if (!model) {
    console.log(
      chalk.yellow("No selection; falling back to default:"),
      DEFAULT_MODEL
    );
    return DEFAULT_MODEL;
  }
  return model;
}

// Summary printing
export function printSummary(score, details, genLatencies) {
  console.log(chalk.magenta.bold("\nGame Summary"));
  console.log("Score:", chalk.bold(`${score}/${TOTAL_QUESTIONS}`));
  const percent = Math.round((score / TOTAL_QUESTIONS) * 100);
  console.log("Accuracy:", percent + "%");

  if (genLatencies.length) {
    const avg = genLatencies.reduce((a, b) => a + b, 0) / genLatencies.length;
    const fastest = Math.min(...genLatencies);
    const slowest = Math.max(...genLatencies);
    console.log(chalk.dim("\nQuestion generation timing (ms):"));
    console.log(
      chalk.dim(
        `  Avg: ${avg.toFixed(0)}  Fastest: ${fastest.toFixed(
          0
        )}  Slowest: ${slowest.toFixed(0)}`
      )
    );
  }

  if (percent === 100)
    console.log(chalk.green("Perfect score! Trivia master."));
  else if (percent >= 70) console.log(chalk.green("Great job!"));
  else if (percent >= 40) console.log(chalk.yellow("Not bad—keep practicing."));
  else console.log(chalk.red("Tough round. Try again!"));

  console.log("\nThanks for playing!");
}
