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

### 5. Exercise 2 (Natural Language Todo CLI)

**Goal:** Build a natural language interface for todo management using Ollama's tool calling and MCP

This exercise demonstrates:

- Native tool calling with Ollama (OpenAI-compatible format)
- Model Context Protocol (MCP) for standardized tool integration
- Building conversational interfaces for tool execution

#### How It Works

The completed implementation shows:

1. **MCP Integration** - Connects to a todo server and discovers available tools
2. **Tool Calling** - Ollama receives tool definitions and automatically maps natural language to function calls
3. **Execution** - Selected tools are executed via MCP and results displayed

No manual JSON parsing or prompt engineering needed - the model handles everything!

#### Setup

```bash
cd exercise2
npm install
cd todo-app && npm install
```

#### Run

```bash
node cli.js
```

#### Example Commands

```
show my todos
add a todo to buy groceries
complete the first todo
what can you help me with?
```

#### Key Concepts

- **Native Tool Calling**: Industry-standard OpenAI function calling format
- **MCP**: Clean separation between AI decision-making and tool execution
- **Conversational**: Model can respond with text or call tools as appropriate

---

Happy hacking! 🚀
