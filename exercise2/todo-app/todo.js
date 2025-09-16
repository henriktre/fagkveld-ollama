import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = process.env.TODO_DATA_FILE
  ? path.resolve(process.env.TODO_DATA_FILE)
  : path.join(__dirname, "todos.json");

async function readTodos() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeTodos(todos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf8");
}

export async function listTodos() {
  return readTodos();
}

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

export async function completeTodo(id) {
  const todos = await readTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  todos[idx].done = true;
  todos[idx].completedAt = new Date().toISOString();
  await writeTodos(todos);
  return todos[idx];
}

export async function removeTodo(id) {
  const todos = await readTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  const [removed] = todos.splice(idx, 1);
  await writeTodos(todos);
  return removed;
}

export async function clearCompleted() {
  const todos = await readTodos();
  const remaining = todos.filter((t) => !t.done);
  const removed = todos.length - remaining.length;
  await writeTodos(remaining);
  return removed;
}
