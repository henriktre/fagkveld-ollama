const url = "http://localhost:11434/api";
import { Ollama } from "ollama";

const ollama = new Ollama();
const MODEL = "gemma3:4b";

// fetch(`${url}/tags`)
//    .then((res) => res.json())
//    .then(console.log);

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
//   .then(console.log);

ollama
  .chat({
    model: MODEL,
    messages: [
      { role: "system", content: "you are homer simpson, answer as he would" },
      {
        role: "user",
        content: "why is the sky blue",
      },
    ],
  })
  .then((res) => console.log(res.message.content));
