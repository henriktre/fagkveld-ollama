## Fagkveld: Getting Started with Ollama

This repository contains exercises to explore the local Ollama LLM runtime and related tooling.

**Workshop Structure:**
- **exercise0**: Introduction to Ollama API (list models, generate, chat)
- **exercise1**: Build a trivia quiz with AI question generation and answer evaluation
- **exercise2**: Natural language todo CLI using Model Context Protocol (MCP)

Each exercise includes boilerplate code with TODOs and detailed comments to guide you through implementation.

---

### 1. Prerequisites

Install and start Ollama locally.

Docs: https://ollama.com

Optional Open Web UI (nice companion interface):
https://docs.openwebui.com/getting-started/quick-start/

Verify it's running:

```bash
ollama ps
ollama list
```

feel fry to experiment with different ui, (terminal, ollama client and open web ui)

```bash
ollama run gemma3:270m
```

---

### 2. Clone This Repo

Pick one method:

HTTPS:

```bash
git clone https://github.com/henriktre/fagkveld-ollama.git
```

SSH:

```bash
git clone git@github.com:henriktre/fagkveld-ollama.git
```

GitHub CLI:

```bash
gh repo clone henriktre/fagkveld-ollama
```

Then:

```bash
cd fagkveld-ollama
```

---

### 3. Exercise 0 (Introduction)

**Goal:** Get familiar with the Ollama API

Open `exercise0/index.js` to see three example sections demonstrating different ways to interact with Ollama:

1. **List local models** - Using the `/tags` endpoint
2. **Simple text generation** - Using the `/generate` endpoint with raw fetch
3. **Chat completion** - Using the `ollama` JavaScript client library

Each section is commented out initially. Uncomment and run them one at a time to see how they work.

#### Setup

```bash
cd exercise0
npm install
```

#### Run

```bash
npm start
# or
node index.js
```

**Tip:** Try modifying the prompts and system messages to see how the AI responds differently!

---

### 4. Exercise 1 (Trivia Quiz)

**Goal:** Build an AI-powered trivia quiz that generates questions and evaluates answers

This exercise teaches you:
- How to craft effective prompts for specific tasks
- Working with structured AI responses (JSON)
- Building interactive CLI applications with AI

#### What You'll Implement

1. **generateQuestion()** - Use the AI to create trivia questions
2. **evaluateAnswer()** - Use the AI to grade user answers
3. **Prompt engineering** - Write clear instructions for the model

The file includes detailed TODO comments and example code structure to guide you.

#### Setup

```bash
cd exercise1
npm install
```

#### Run

```bash
npm start
# or
node index.js
```

**Hints:** 
- Look at exercise0 examples for ollama.chat() syntax
- See the README.md in exercise1 for prompt suggestions
- The AI should return JSON for answer evaluation

---

### 5. Exercise 2 (MCP Todo CLI)

**Goal:** Build a natural language interface for todo management using Model Context Protocol

This exercise demonstrates:
- How AI can map natural language to structured tool calls
- Integration with external systems via MCP
- Advanced prompt engineering for tool selection

#### What You'll Implement

The `planAPI()` function that:
1. Takes user input like "create a todo to buy milk"
2. Uses the AI to determine which tool to call (add_todo, list_todos, etc.)
3. Extracts structured arguments from natural language

The MCP server is already implemented - you just need to connect the AI planning layer!

#### Setup

```bash
cd exercise2
npm install
(cd todo-app && npm install)
```

#### Run

```bash
node cli.js
```

#### Example Commands

```
create a todo to get coffee
show my todos
finish the task to get coffee
get my finished todos
```

**Bonus Challenge:** Implement the `planLibrary()` function as an alternative using `ollama.chat()`!

---

Happy hacking! 🚀
