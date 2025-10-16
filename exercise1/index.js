// Import necessary libraries
import { Ollama } from "ollama";
import readline from "node:readline";

// Configuration: Update with your preferred model
const MODEL = "gpt-oss:20b";
const TOTAL_QUESTIONS = 3;

// Initialize Ollama client
const ollama = new Ollama();

// ============================================================================
// PROMPT ENGINEERING SECTION
// ============================================================================
// These instructions and prompts guide the AI model's behavior.
// Good prompts are clear, specific, and provide structure for the response.

/**
 * System instruction for generating trivia questions.
 * TODO: Replace this placeholder with a proper instruction that:
 * - Tells the model it's a trivia quiz master
 * - Specifies the output format (just the question text, no numbering)
 * - Sets the style (general knowledge, concise, clear)
 * - Instructs to avoid yes/no questions
 */
const QUESTION_INSTRUCTION = `create an instruction for the model to generate a trivia question`;

/**
 * Creates a prompt for generating a new trivia question.
 * @param {Array<string>} previous - List of previously asked questions
 * @returns {string} Prompt for the model
 *
 * TODO: Replace this placeholder with a prompt that:
 * - Asks for a single trivia question
 * - If there are previous questions, lists them to avoid repetition
 * - Emphasizes returning only the question text
 */
const QUESTION_PROMPT = (previous) => {
  return `create a prompt to instruct the model to generate a trivia question
  optionally including previous questions to avoid similar topics.`;
};

/**
 * System instruction for evaluating trivia answers.
 * TODO: Replace this placeholder with an instruction that:
 * - Tells the model it's an impartial answer grader
 * - Specifies exact JSON format: {"correct": boolean, "shortFeedback": string, "modelAnswer": string}
 * - Provides grading guidelines (allow minor spelling errors, be fair but strict)
 */
const EVALUATOR_INSTRUCTION = `
create an instruction for the model to evaluate a trivia answer`;

/**
 * Creates a prompt for evaluating a user's answer.
 * @param {string} question - The trivia question
 * @param {string} userAnswer - The user's answer
 * @returns {string} Prompt for the model
 *
 * TODO: Replace this placeholder with a prompt that:
 * - Includes both the question and the user's answer
 * - Asks for the response in JSON format only
 */
const EVALUATOR_PROMPT = (question, userAnswer) => {
  return `create a prompt to instruct the model to evaluate a trivia answer
  including the question and the user's answer.`;
};

// ============================================================================
// TASK 1: Generate Trivia Questions
// ============================================================================
/**
 * Generates a trivia question using the Ollama model.
 * @param {Array<string>} previous - Array of previously asked questions
 * @returns {Promise<string>} The generated trivia question
 *
 * TODO: Implement this function using ollama.chat() or API fetch
 *
 * Steps to complete:
 * 1. Call ollama.chat() with the MODEL constant
 * 2. Pass a messages array with two messages:
 *    - First message: role "system", content: QUESTION_INSTRUCTION
 *    - Second message: role "user", content: QUESTION_PROMPT(previous)
 * 3. Extract and return the text content from the response
 *
 * Documentation: https://github.com/ollama/ollama-js
 *
 * Example structure:
 * const response = await ollama.chat({
 *   model: MODEL,
 *   messages: [
 *     { role: "system", content: QUESTION_INSTRUCTION },
 *     { role: "user", content: QUESTION_PROMPT(previous) }
 *   ]
 * });
 * return response.message.content;
 */
async function generateQuestion(previous) {
  // TODO: implement using ollama.chat() or API fetch
  return "TODO: implement me";
}

// ============================================================================
// TASK 2: Evaluate User Answers
// ============================================================================
/**
 * Evaluates the user's answer to a trivia question.
 * @param {string} question - The trivia question that was asked
 * @param {string} userAnswer - The user's answer to evaluate
 * @returns {Promise<{correct: boolean, shortFeedback: string, modelAnswer: string}>}
 *
 * TODO: Implement this function using ollama.chat() or API fetch
 *
 * Steps to complete:
 * 1. Call ollama.chat() with the MODEL constant
 * 2. Pass a messages array with:
 *    - System message with EVALUATOR_INSTRUCTION
 *    - User message with EVALUATOR_PROMPT(question, userAnswer)
 * 3. Parse the response as JSON (it should contain a JSON object)
 * 4. Return the parsed object
 *
 * The model should respond with JSON like:
 * {"correct": true/false, "shortFeedback": "...", "modelAnswer": "..."}
 *
 * Tip: You may need to extract the JSON from the response text using:
 * - String methods like indexOf and slice
 * - Or regex to find the JSON object
 */
async function evaluateAnswer(question, userAnswer) {
  // TODO: implement using ollama.chat() or API fetch
  return "TODO: implement me";
}

// ============================================================================
// MAIN QUIZ LOOP
// ============================================================================
/**
 * Main function that runs the trivia quiz.
 * This orchestrates the entire quiz flow:
 * 1. Generates questions one by one
 * 2. Displays them to the user
 * 3. Captures user input
 * 4. Evaluates answers
 * 5. Tracks and displays the score
 */
async function main() {
  console.log("\n=== Trivia Quiz (Exercise 1) ===");
  console.log("Model:", MODEL, "\n");

  let score = 0;
  const asked = [];

  // Loop through the total number of questions
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    console.log(`Question ${i}/${TOTAL_QUESTIONS}`);

    // Generate a new question, passing previously asked questions
    const question = await generateQuestion(asked);
    console.log(question);

    // Get the user's answer from the terminal
    const answer = await askInput("Your answer: ");
    if (answer === undefined) {
      console.log("Aborted.");
      break;
    }

    // Evaluate the answer using the AI model
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

    // Keep track of asked questions to avoid repetition
    asked.push(question);
  }

  console.log("Final Score:", score, "/", TOTAL_QUESTIONS);
  rl.close();
}

// ============================================================================
// UTILITY FUNCTIONS (No changes needed here)
// ============================================================================

/**
 * Helper function to get input from the terminal.
 * This wraps readline in a Promise for easier async/await usage.
 * @param {string} question - The prompt to display
 * @returns {Promise<string>} The user's input
 */
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
