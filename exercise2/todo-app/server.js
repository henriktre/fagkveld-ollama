#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  listTodos,
  addTodo,
  completeTodo,
  removeTodo,
  clearCompleted,
} from "./todo.js";

const server = new McpServer({
  name: "todo-mcp",
  version: "0.1.0",
});

// List todos
server.registerTool(
  "list_todos",
  {
    title: "List Todos",
    description: "Return all current todos",
    inputSchema: {},
  },
  async () => {
    const todos = await listTodos();
    return {
      content: [{ type: "text", text: JSON.stringify(todos, null, 2) }],
    };
  }
);

// Add todo
server.registerTool(
  "add_todo",
  {
    title: "Add Todo",
    description: "Add a new todo item",
    inputSchema: { title: z.string() },
  },
  async ({ title }) => {
    const todo = await addTodo(title);
    return { content: [{ type: "text", text: JSON.stringify(todo, null, 2) }] };
  }
);

// Complete todo
server.registerTool(
  "complete_todo",
  {
    title: "Complete Todo",
    description: "Mark a todo as completed by id",
    inputSchema: { id: z.string().uuid() },
  },
  async ({ id }) => {
    try {
      const todo = await completeTodo(id);
      return {
        content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

// Remove todo
server.registerTool(
  "remove_todo",
  {
    title: "Remove Todo",
    description: "Remove a todo by id",
    inputSchema: { id: z.string().uuid() },
  },
  async ({ id }) => {
    try {
      const todo = await removeTodo(id);
      return {
        content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

// Clear completed
server.registerTool(
  "clear_completed",
  {
    title: "Clear Completed Todos",
    description: "Remove all completed todos",
    inputSchema: {},
  },
  async () => {
    const count = await clearCompleted();
    return {
      content: [{ type: "text", text: `Removed ${count} completed todos` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
