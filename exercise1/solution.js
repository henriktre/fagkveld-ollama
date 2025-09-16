import { Ollama } from "ollama";
import readline from "node:readline";
const ollama = new Ollama();

const MODEL = "gpt-oss:20b";
const TOTAL_QUESTIONS = 3;

const QUESTION_INSTRUCTION = `You are a trivia quiz master.
Task: Generate ONE clear general knowledge trivia question.
Output Rules:
  - Only the question text
  - No numbering, no answers, no hints
  - Avoid repeating earlier topics listed by the user
Style:
  - Concise, neutral tone
  - Prefer not yes/no questions
  - Must end with a question mark
`;

const QUESTION_PROMPT = (previous) => {
  if (previous.length === 0)
    return `Generate a question. Only the question text.`;
  const lines = previous.map((q, i) => ` - ${i + 1}. ${q}`);
  return `All previous questions (avoid similar topics):\n${lines.join(
    "\n"
  )}\n\nGenerate a question. Only the question text.`;
};

const EVALUATOR_INSTRUCTION = `You are an impartial trivia answer grader.
Return ONLY JSON:
{"correct": boolean, "shortFeedback": "one short sentence", "modelAnswer": "concise expected answer"}
Guidelines:
  - Allow minor spelling mistakes / synonyms
  - If missing key detail -> correct = false
  - shortFeedback <= 12 words
`;

const EVALUATOR_PROMPT = (question, userAnswer) =>
  `Question: ${question}\nPlayer answer: ${userAnswer}\nReturn ONLY the JSON.`;

// Task 1: fetch a trivia question from the model, suggestion for a prompt is in the readme
// documentation for ollama.chat: https://ollama.com/docs/api/node#chat
async function generateQuestion(previous) {
  const question = await ollama.chat({
    model: MODEL,
    messages: [
      { role: "system", content: QUESTION_INSTRUCTION },
      { role: "user", content: QUESTION_PROMPT(previous) },
    ],
  });
  return question.message.content;
}
async function evaluateAnswer(question, userAnswer) {
  const answer = await ollama.chat({
    model: MODEL,
    messages: [
      { role: "system", content: EVALUATOR_INSTRUCTION },
      {
        role: "user",
        content: EVALUATOR_PROMPT(question, userAnswer),
      },
    ],
  });

  const a = answer.message.content;
  return JSON.parse(a.slice(a.indexOf("{"), a.lastIndexOf("}") + 1));
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

//ignore
// Utility: ask a question in terminal (Promise wrapper around readline)
function askInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

main().catch((err) => {
  console.error("Unexpected error:", err);
  rl.close();
  process.exit(1);
});
