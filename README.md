## Fagkveld: Getting Started with Ollama

This repository contains small exercises to explore the local Ollama LLM runtime and related tooling (chat API, simple quiz, MCP todo server + CLI).

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

### 3. Exercise 0 (Intro)

Open `exercise0/index.js`.

The file has three commented example sections—uncomment and run them one at a time:

1. List local models (tags)
2. Simple generate request (`/generate` endpoint)
3. Chat example using the `ollama` JS client

### Setup

```bash
cd exercise0
npm i
```

### run with

```bash
npm start
```

or

```bash
node index.js
```

Re‑comment before moving on to keep output clean.

---

### 4. What Comes Next

Following exercises (see their folders for details):

- `exercise1`: Trivia quiz powered by a model
- `exercise2`: MCP todo server + CLI with natural language -> tool planning

---

Happy hacking! 🚀
