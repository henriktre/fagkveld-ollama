# Exercise 2: Natural Language Todo CLI with MCP

**Time:** ~45-60 minutes  
**Difficulty:** Intermediate to Advanced

## Goal

Build a todo application where users can interact using **natural language** instead of structured commands.

Instead of typing structured commands:
```bash
add-todo "Buy milk"
list-todos --filter done
complete-todo abc-123-def
```

Users can type naturally:
```
create a todo to buy milk
show me my completed tasks
mark the milk task as done
```

This is powered by:
- **Model Context Protocol (MCP)**: A standard for AI-tool integration
- **AI Planning**: Using a language model to map natural language to structured tool calls

---

## Architecture Overview

```
User Input ("create a todo to buy milk")
    ↓
AI Model (planAPI function) ← YOUR TASK
    ↓
Structured Tool Call ({tool: "add_todo", args: {title: "buy milk"}})
    ↓
MCP Server (executes the tool)
    ↓
Result (todo created, displayed to user)
```

The MCP server and tools are **already implemented**. Your job is to implement the AI planning layer!

---

## Prerequisites

- Node.js >= 18
- [Ollama](https://ollama.com) running locally
- Recommended model: `ollama pull gpt-oss:20b`

---

## Setup

From the `exercise2` directory:

```bash
npm install
(cd todo-app && npm install)
```

---

## Your Task: Implement `planAPI(prompt, tools)`

This function is the brain of the application. It takes:
- **Input:** Natural language from the user
- **Context:** List of available MCP tools
- **Output:** A structured plan of which tool to call with what arguments

### Implementation Steps

1. **Build the tool list** (already done)
   - Create a formatted string listing all available tools and their descriptions

2. **Create the system prompt**
   - Instruct the model to map user input to a tool
   - Specify the exact JSON format: `{"tool":"name","args":{}}`
   - Be clear and concise

3. **Call Ollama's /generate endpoint**
   - Use `fetch()` to POST to `${HOST}/api/generate`
   - Include: model name, combined prompt, stream: false
   - See `exercise0` for fetch examples

4. **Extract and parse the JSON**
   - The response will contain JSON somewhere in the text
   - Use regex or string methods to find it
   - Parse with `JSON.parse()`
   - Return the parsed object or null on failure

### Example Tool Mappings

Your function should produce results like:

| User Input | Expected Output |
|------------|----------------|
| "show my todos" | `{tool: "list_todos", args: {}}` |
| "add a task to buy milk" | `{tool: "add_todo", args: {title: "buy milk"}}` |
| "complete task abc-123" | `{tool: "complete_todo", args: {id: "abc-123"}}` |
| "remove all done tasks" | `{tool: "clear_completed", args: {}}` |

---

## Run

From `exercise2` directory:

```bash
node cli.js
```

Then start typing! Press Ctrl+C to exit.

---

## Usage Examples

Try these natural language commands:

```
create a todo to get coffee
add a task to finish the workshop
show my todos
what are my tasks?
finish the coffee task
mark the workshop task as done
show me completed tasks
delete all finished todos
```

---

## Available MCP Tools

The server provides these tools (you don't need to implement them):

- **list_todos** - Returns all current todos
- **add_todo** (title: string) - Creates a new todo
- **complete_todo** (id: uuid) - Marks a todo as done
- **remove_todo** (id: uuid) - Deletes a specific todo  
- **clear_completed** - Removes all completed todos

---

## Environment Variables

- `OLLAMA_MODEL` (default: `gpt-oss:20b`) - Which model to use for planning
- `OLLAMA_HOST` (default: `http://localhost:11434`) - Ollama server URL

---

## Bonus Challenge

Once `planAPI()` works, try implementing `planLibrary()`:
- Uses `ollama.chat()` instead of raw `fetch()`
- Same functionality, cleaner code
- Uncomment the line in `main()` to test it

Compare the two approaches and see which you prefer!

---

## Tips

1. **Start with simple prompts** - Test with "show todos" before complex ones
2. **Check the JSON format** - Print the raw response to see what the model returns
3. **Be specific in your system prompt** - The model needs clear instructions
4. **Handle errors gracefully** - Not all user input will map perfectly to tools

---

## Common Issues

**Issue:** Model returns text instead of JSON  
**Fix:** Make your system prompt more explicit: "Return ONLY JSON, no other text"

**Issue:** Wrong tool selected  
**Fix:** Improve tool descriptions or add examples in the prompt

**Issue:** Arguments not extracted correctly  
**Fix:** Give examples of the expected JSON format in your prompt

---

## Data Persistence

Todos are stored in `todo-app/todos.json`. You can:
- Edit this file directly to seed data
- Delete it to start fresh
- Set `TODO_DATA_FILE` env var to use a different location

---

## Going Further

After completing the exercise:
- Try different models and compare accuracy
- Add more complex tools (priorities, due dates, tags)
- Implement multi-step planning (chaining multiple tool calls)
- Add conversation history for context-aware planning
- Build a web UI instead of CLI

---
