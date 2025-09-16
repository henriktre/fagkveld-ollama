## Prerequisites

- Node.js >= 18
- [Ollama](https://ollama.com) running locally if you want natural language planning.
  - Pull model: `ollama pull gpt-oss:20b`

## Install

From `exercise2` directory:

```
npm install
(cd todo-app && npm install)
```

## Run

From `exercise2` directory:

```
node cli.js
```

Then just start typing. Press Ctrl+C (or send EOF) to exit.

Environment variables:

- `OLLAMA_MODEL` (default `gpt-oss:20b`)
- `OLLAMA_HOST` (default `http://localhost:11434`)

## Usage Examples

```
create a todo to get coffee
show my todos
finish the task to get a coffee
get my finished todos
```

## Tools

- `list_todos`
- `add_todo` (title)
- `complete_todo` (id)
- `remove_todo` (id)
- `clear_completed`

## Data Persistence

Todos are stored in `todo-app/todos.json`.
