// ============================================================================
// ⚠️ SOLUTION FILE - REFERENCE IMPLEMENTATION ⚠️
// ============================================================================
// This file contains a complete, working solution to Exercise 1.
//
// If you're stuck and need help, you can refer to this file to see how
// the different parts can be implemented. However, we encourage you to:
// 1. Try implementing it yourself first
// 2. Use the hints and documentation in index.js and README.md
// 3. Only look at specific parts of this solution when you're really stuck
//
// Learning happens through struggle and discovery - use this wisely! 💡
// ============================================================================

import { Ollama } from "ollama";
import readline from "node:readline";

// Initialize the Ollama client - this will connect to your local Ollama instance
const ollama = new Ollama();

// Model configuration - make sure you have this model pulled locally
const MODEL = "gpt-oss:20b";
const TOTAL_QUESTIONS = 3;

// ============================================================================
// STEP 1: Define the System Instruction for Question Generation
// ============================================================================
// This instruction tells the AI what role to play and how to behave.
// Key elements:
// - Clear role definition ("You are a trivia quiz master")
// - Specific output format (only question text, no extras)
// - Style guidelines (concise, avoid yes/no questions)
// - Context awareness (avoid repeating topics)
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

// ============================================================================
// STEP 2: Create Dynamic User Prompt for Question Generation
// ============================================================================
// This function generates the user message based on context.
// If there are previous questions, it lists them so the AI avoids repetition.
// This demonstrates how to use conversation history to improve responses.
const QUESTION_PROMPT = (previous) => {
  // First question - simple prompt
  if (previous.length === 0)
    return `Generate a question. Only the question text.`;

  // Subsequent questions - include previous questions to avoid repetition
  const lines = previous.map((q, i) => ` - ${i + 1}. ${q}`);
  return `All previous questions (avoid similar topics):\n${lines.join(
    "\n"
  )}\n\nGenerate a question. Only the question text.`;
};

// ============================================================================
// STEP 3: Define the System Instruction for Answer Evaluation
// ============================================================================
// This instruction tells the AI how to grade answers.
// Key points:
// - Request specific JSON format for structured output
// - Provide grading guidelines (be fair but accurate)
// - Keep feedback concise
const EVALUATOR_INSTRUCTION = `You are an impartial trivia answer grader.
Return ONLY JSON:
{"correct": boolean, "shortFeedback": "one short sentence", "modelAnswer": "concise expected answer"}
Guidelines:
  - Allow minor spelling mistakes / synonyms
  - If missing key detail -> correct = false
  - shortFeedback <= 12 words
`;

// ============================================================================
// STEP 4: Create User Prompt for Answer Evaluation
// ============================================================================
// Simple prompt that provides the question and user's answer to be evaluated
const EVALUATOR_PROMPT = (question, userAnswer) =>
  `Question: ${question}\nPlayer answer: ${userAnswer}\nReturn ONLY the JSON.`;

// ============================================================================
// STEP 5: Implement the generateQuestion Function
// ============================================================================
// This function generates a trivia question using the Ollama chat API.
//
// How it works:
// 1. Call ollama.chat() with the model name
// 2. Pass two messages:
//    - System message: defines the AI's role and behavior
//    - User message: the specific request with context
// 3. Extract the text content from the response
// 4. Return the generated question
//
// The ollama.chat() method returns a response object with this structure:
// { message: { role: 'assistant', content: 'the generated text' }, ... }
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
// ============================================================================
// STEP 6: Implement the evaluateAnswer Function
// ============================================================================
// This function evaluates a user's answer using the Ollama chat API.
//
// How it works:
// 1. Call ollama.chat() with the evaluator instructions
// 2. The AI responds with JSON containing the evaluation
// 3. Extract the JSON from the response (may have extra text)
// 4. Parse and return the JSON object
//
// JSON extraction technique:
// - Find the first '{' character
// - Find the last '}' character
// - Extract the substring between them
// - Parse it as JSON
//
// This handles cases where the AI includes extra text before/after the JSON
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

  // Extract and parse the JSON from the response
  const a = answer.message.content;
  return JSON.parse(a.slice(a.indexOf("{"), a.lastIndexOf("}") + 1));
}

// ============================================================================
// STEP 7: Main Quiz Loop
// ============================================================================
// This is the main function that orchestrates the entire quiz.
//
// Flow:
// 1. Initialize score and tracking array
// 2. Loop for TOTAL_QUESTIONS iterations
// 3. For each iteration:
//    a. Generate a question (passing previous questions for context)
//    b. Display the question to the user
//    c. Get user's answer from terminal input
//    d. Evaluate the answer using AI
//    e. Display feedback and update score
//    f. Add question to the tracking array
// 4. Display final score
// 5. Clean up (close readline interface)
async function main() {
  console.log("\n=== Trivia Quiz (Exercise 1) ===");
  console.log("Model:", MODEL, "\n");

  let score = 0;
  const asked = []; // Tracks previously asked questions

  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    console.log(`Question ${i}/${TOTAL_QUESTIONS}`);

    // Generate a new question
    const question = await generateQuestion(asked);
    console.log(question);

    // Get user's answer
    const answer = await askInput("Your answer: ");
    if (answer === undefined) {
      console.log("Aborted.");
      break;
    }

    // Evaluate the answer using AI
    const evalResult = await evaluateAnswer(question, answer);

    // Display results and update score
    if (evalResult.correct) {
      score++;
      console.log("✔ Correct!");
    } else {
      console.log(
        "✖ Incorrect. Expected:",
        evalResult.modelAnswer || "(no answer)"
      );
    }

    // Track this question to avoid repetition
    asked.push(question);
  }

  console.log("Final Score:", score, "/", TOTAL_QUESTIONS);
  rl.close();
}

// ============================================================================
// Helper Functions and Setup
// ============================================================================

// Utility function: Wraps readline.question() in a Promise for async/await usage
// This allows us to use 'await' to get user input, making the code cleaner
function askInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// Create readline interface for terminal input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Run the quiz and handle any errors
main().catch((err) => {
  console.error("Unexpected error:", err);
  rl.close();
  process.exit(1);
});
