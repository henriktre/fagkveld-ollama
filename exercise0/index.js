// Base URL for Ollama API (default local installation)
const url = "http://localhost:11434/api";

// Import the Ollama JavaScript client library
import { Ollama } from "ollama";

// Initialize Ollama client (connects to default host: http://localhost:11434)
const ollama = new Ollama();

// Specify which model to use (make sure it's pulled: ollama pull gemma3:4b)
const MODEL = "gemma3:4b";

// ============================================================================
// EXAMPLE 1: List all locally available models using raw fetch API
// ============================================================================
// Uncomment the code below to see all models you have pulled locally
// This uses the /tags endpoint to retrieve model information
//
fetch(`${url}/tags`)
  .then((res) => res.json())
  .then(console.log);

// ============================================================================
// EXAMPLE 2: Simple text generation using the /generate endpoint
// ============================================================================
// Uncomment this to generate text from a prompt using raw fetch API
// The 'stream: false' option returns the complete response at once
//
// fetch(`${url}/generate`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     model: MODEL,
//     prompt: "Why is the sky blue?",
//     stream: false,
//   }),
// })
//   .then((res) => res.json())
//   .then((message) => console.log(message.response));

// ============================================================================
// EXAMPLE 3: Chat completion using the Ollama client library
// ============================================================================
// This example shows a conversational approach with system and user messages
// System message: Defines the AI's role/personality
// User message: The actual question or prompt
//
// ollama
//   .chat({
//     model: MODEL,
//     messages: [
//       { role: "system", content: "you are homer simpson, answer as he would" },
//       {
//         role: "user",
//         content: "why is the sky blue",
//       },
//     ],
//   })
//   .then((res) => console.log(res.message.content));
