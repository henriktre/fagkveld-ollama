// ============================================================================
// Todo Data Management
// ============================================================================
// This module handles persistent storage and CRUD operations for todos.
// Data is stored in a JSON file (todos.json) in the same directory.
// ============================================================================

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data file location (can be overridden with TODO_DATA_FILE env var)
const DATA_FILE = process.env.TODO_DATA_FILE
  ? path.resolve(process.env.TODO_DATA_FILE)
  : path.join(__dirname, "todos.json");

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Reads todos from the JSON file.
 * If the file doesn't exist, returns an empty array.
 */
async function readTodos() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

/**
 * Writes todos to the JSON file.
 * Formats the JSON with 2-space indentation for readability.
 */
async function writeTodos(todos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf8");
}

// ============================================================================
// Exported CRUD Operations
// ============================================================================
// These functions are used by the MCP server to manage todos.

/**
 * Lists all todos.
 * @returns {Promise<Array>} Array of todo objects
 */
export async function listTodos() {
  return readTodos();
}

/**
 * Adds a new todo.
 * @param {string} title - The todo title/description
 * @returns {Promise<Object>} The newly created todo object
 */
export async function addTodo(title) {
  const todos = await readTodos();
  const todo = {
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  await writeTodos(todos);
  return todo;
}

/**
 * Marks a todo as completed.
 * @param {string} id - The UUID of the todo to complete
 * @returns {Promise<Object>} The updated todo object
 * @throws {Error} If todo with given id is not found
 */
export async function completeTodo(id) {
  const todos = await readTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  todos[idx].done = true;
  todos[idx].completedAt = new Date().toISOString();
  await writeTodos(todos);
  return todos[idx];
}

/**
 * Removes a todo.
 * @param {string} id - The UUID of the todo to remove
 * @returns {Promise<Object>} The removed todo object
 * @throws {Error} If todo with given id is not found
 */
export async function removeTodo(id) {
  const todos = await readTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  const [removed] = todos.splice(idx, 1);
  await writeTodos(todos);
  return removed;
}

/**
 * Removes all completed todos.
 * @returns {Promise<number>} Count of removed todos
 */
export async function clearCompleted() {
  const todos = await readTodos();
  const remaining = todos.filter((t) => !t.done);
  const removed = todos.length - remaining.length;
  await writeTodos(remaining);
  return removed;
}
