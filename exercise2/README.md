# Exercise 2: Natural Language Todo CLI with MCP

Build a todo application where users interact using natural language instead of rigid commands.

## What You'll Build

A CLI where you can type:

- "create a todo to buy milk" → `add_todo({title: "buy milk"})`
- "show me my todos" → `list_todos()`
- "mark the first task as done" → `complete_todo({id: "..."})`

Powered by:

- **Ollama**: Local AI with tool calling support
- **MCP (Model Context Protocol)**: Standardized AI-tool integration

---

## Architecture

```
User Input → Ollama (tool calling) → MCP Execution → Result
```

The MCP server provides todo tools. Ollama's tool calling maps natural language to function calls.

---

## Prerequisites

- Node.js >= 18
- [Ollama](https://ollama.com) running locally
- A model that supports tool calling:
  - `ollama pull llama3.2:3b` (recommended, smallest)
  - `ollama pull llama3.1:8b` (better quality)
  - `ollama pull mistral` (alternative)

---

## Setup

```bash
npm install
cd todo-app && npm install
```

---

## How It Works

The completed implementation (`cli.js`) demonstrates:

1. **MCP Integration** - Connects to a todo server and discovers available tools
2. **Tool Calling** - Ollama receives tool definitions in OpenAI function calling format
3. **Natural Language** - Model automatically maps user input to tool calls
4. **Execution** - Selected tool is executed via MCP and results displayed

### Key Function: `planWithNativeTools()`

This function uses Ollama's native tool calling:

- Converts MCP tools to OpenAI function calling format
- Passes them to `ollama.chat()` with `tools` parameter
- Model decides which tool to call and extracts parameters
- Returns structured tool call or conversational response

---

## Run

```bash
node cli.js
```

Try these commands:

```
show my todos
add a todo to buy groceries
complete the first todo
what can you help me with?
```

---

## Environment Variables

- `OLLAMA_MODEL` (default: `llama3.2:3b`) - Model to use (must support tool calling)
- `OLLAMA_HOST` (default: `http://localhost:11434`) - Ollama server
- `DEBUG=true` - Enable detailed logging

### Tool Calling Support

Not all models support tool calling. Compatible models include:

- **llama3.1** (8b or larger) - Good balance of speed and quality
- **llama3.2** (3b or larger) - Fastest, still capable
- **mistral** - Alternative option
- **qwen2.5** (7b or larger) - Another good option

To use a different model:

```bash
OLLAMA_MODEL=llama3.1:8b node cli.js
```

---

## Available Tools

The MCP server provides:

- `list_todos` - Returns all todos
- `add_todo(title)` - Creates a new todo
- `complete_todo(id)` - Marks todo as done
- `remove_todo(id)` - Deletes a todo
- `clear_completed` - Removes all completed todos

---

## Key Concepts

### OpenAI Function Calling Format

```javascript
{
  type: "function",
  function: {
    name: "add_todo",
    description: "Add a new todo item",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Todo title" }
      },
      required: ["title"]
    }
  }
}
```

### Tool Calling Flow

1. Model receives tool definitions
2. User provides natural language input
3. Model decides to call a tool or respond with text
4. If tool call: returns `{tool: "name", args: {...}}`
5. We execute the tool via MCP

---

## Going Further

- Try different models and compare accuracy
- Add more tools (priorities, tags, due dates)
- Implement multi-step planning
- Add conversation history
- Build a web UI

---
