#!/usr/bin/env node
// ============================================================================
// MCP Todo Server
// ============================================================================
// This file implements a Model Context Protocol (MCP) server that exposes
// todo management tools. The server runs via stdio and can be connected to
// by MCP clients (like our CLI in cli.js).
//
// Available Tools:
// - list_todos: Get all todos
// - add_todo: Create a new todo
// - complete_todo: Mark a todo as done
// - remove_todo: Delete a todo
// - clear_completed: Remove all completed todos
// ============================================================================

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

// Initialize the MCP server
const server = new McpServer({
  name: "todo-mcp",
  version: "0.1.0",
});

// ============================================================================
// Tool Registration
// ============================================================================
// Each tool is registered with:
// - A unique name
// - Metadata (title, description)
// - Input schema (what parameters it accepts)
// - Handler function (what it does)

// List todos tool - returns all current todos
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

// Add todo tool - creates a new todo with the given title
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

// Complete todo tool - marks a todo as done by its ID
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

// Remove todo tool - deletes a todo by its ID
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

// Clear completed tool - removes all completed todos
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

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
