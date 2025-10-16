#!/usr/bin/env node
// ============================================================================
// Exercise 2: Natural Language Todo CLI with MCP (Model Context Protocol)
// ============================================================================
// This exercise demonstrates how to use an AI model to map natural language
// commands to structured tool calls via the Model Context Protocol.
//
// Key concepts:
// - MCP: A protocol for LLMs to interact with external tools/data sources
// - Natural Language Planning: Using AI to understand user intent
// - Tool Calling: Executing structured functions based on AI understanding
//
// Example interactions:
// - "create a todo to get coffee" → calls add_todo tool
// - "show my todos" → calls list_todos tool
// - "finish task 1" → calls complete_todo tool
// ============================================================================

import readline from "readline";
import fetch from "node-fetch";
import { Client } from "@modelcontextprotocol/sdk/client";
import { Ollama } from "ollama";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Configuration: Model and host settings
const MODEL = process.env.OLLAMA_MODEL || "gpt-oss:20b";
const HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const ollama = new Ollama({ host: HOST });

// ============================================================================
// MCP SERVER SETUP (No changes needed)
// ============================================================================

/**
 * Starts the MCP todo server process via stdio and returns an initialized client.
 * The server provides tools for managing todos (list, add, complete, remove, etc.)
 * 
 * @returns {Promise<{client: import('@modelcontextprotocol/sdk/client').Client, toolsMeta: Array<any>}>}
 */
async function startMcp() {
  // Create a transport that communicates with the server via stdin/stdout
  const transport = new StdioClientTransport({
    command: "node",
    args: ["todo-app/server.js"],
    stderr: "inherit",
  });
  
  // Initialize the MCP client
  const client = new Client({ name: "todo-cli", version: "0.3.1" });
  await client.connect(transport);
  transport.onclose = () => {};
  
  // Get metadata about all available tools from the server
  const toolsMeta = (await client.listTools()).tools;
  return { client, toolsMeta };
}

// ============================================================================
// TOOL EXECUTION (No changes needed)
// ============================================================================

/**
 * Calls an MCP tool and unwraps the result.
 * 
 * @param {any} client - MCP Client instance
 * @param {string} name - Tool name (e.g., "add_todo", "list_todos")
 * @param {Record<string,any>} args - Arguments for the tool
 * @returns {Promise<{text?: string, error?: string}>} Tool execution result
 */
async function callTool(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError)
    return { error: result.content?.[0]?.text || "Unknown tool error" };
  return { text: result.content?.[0]?.text };
}

// ============================================================================
// TASK: NATURAL LANGUAGE TO TOOL MAPPING
// ============================================================================

/**
 * Plans a tool invocation from natural language using an Ollama model.
 * This is the core AI function that understands user intent and maps it to
 * the appropriate tool and arguments.
 * 
 * @param {string} prompt - User natural language input (e.g., "create a todo to get coffee")
 * @param {Array<any>} tools - Current list of tool metadata from the MCP server
 * @returns {Promise<{tool: string, args?: Record<string,any>} | null>} Planned tool invocation or null
 * 
 * TODO: Complete this implementation using the Ollama /generate API
 * 
 * Steps to implement:
 * 1. Build a list of available tools with their descriptions
 * 2. Create a system prompt that instructs the model to:
 *    - Map user requests to available MCP todo tools
 *    - Return ONLY JSON in the format: {"tool":"name","args":{}}
 * 3. Make a fetch request to ${HOST}/api/generate with:
 *    - model: MODEL
 *    - prompt: system instruction + user input
 *    - stream: false
 * 4. Parse the response and extract the JSON object
 * 5. Return the parsed object or null if parsing fails
 * 
 * Example system prompt structure:
 * "Map the user request to one MCP todo tool.
 *  Tools:
 *  list_todos: Return all current todos
 *  add_todo: Add a new todo item
 *  ...
 *  Return JSON {"tool":"name","args":{}}."
 * 
 * Example JSON responses:
 * - "show my todos" → {"tool":"list_todos","args":{}}
 * - "add todo to buy milk" → {"tool":"add_todo","args":{"title":"buy milk"}}
 * - "complete task abc-123" → {"tool":"complete_todo","args":{"id":"abc-123"}}
 */
async function planAPI(prompt, tools) {
  // Build tool list for the prompt
  const list = tools
    .map((t) => `${t.name}: ${t.description || ""}`.trim())
    .join("\n");
  
  // TODO: Create the system instruction
  const sys = `Map the user request to one MCP todo tool.\nTools:\n${list}\nReturn JSON {"tool":"name","args":{}}.`;
  
  // TODO: Make the API call and parse the response
  try {
    // TODO: Implement the fetch call to ${HOST}/api/generate
    // Hint: Use the same structure as in exercise0
    const res = await fetch(`${HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${sys}\nUser: ${prompt}\nAssistant:`,
        stream: false,
      }),
    });
    
    // TODO: Extract and parse the JSON from the response
    const json = await res.json();
    const match = (json.response || "").match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

// ============================================================================
// BONUS TASK (OPTIONAL): Alternative Implementation Using Ollama Client
// ============================================================================

/**
 * Alternative implementation using the official ollama-js client library.
 * This does the same thing as planAPI() but uses ollama.chat() instead of raw fetch.
 * 
 * @param {string} prompt - User natural language input
 * @param {Array<any>} tools - Current list of tool metadata
 * @returns {Promise<{tool: string, args?: Record<string,any>} | null>}
 * 
 * BONUS TODO (Optional): Implement this using ollama.chat()
 * This is similar to exercise1 but for tool planning instead of trivia.
 * 
 * Steps:
 * 1. Use the same tool list and system instruction as planAPI()
 * 2. Call ollama.chat() with system and user messages
 * 3. Extract the JSON from the response
 * 4. Return the parsed object
 * 
 * Try switching between planAPI() and planLibrary() in the main() function
 * to see the difference!
 */
async function planLibrary(prompt, tools) {
  const list = tools
    .map((t) => `${t.name}: ${t.description || ""}`.trim())
    .join("\n");
  const sys = `Map the user request to one MCP todo tool.\nTools:\n${list}\nReturn JSON {"tool":"name","args":{}}.`;
  
  try {
    // TODO (BONUS): Implement using ollama.chat()
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
      stream: false,
    });
    const text = response.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

// ============================================================================
// MAIN INTERACTIVE LOOP
// ============================================================================

/**
 * Entrypoint: starts MCP client, runs interactive loop mapping natural language to tools.
 * Handles graceful shutdown on EOF / SIGINT.
 * 
 * Flow:
 * 1. Start the MCP server and get available tools
 * 2. Create an interactive readline prompt
 * 3. For each user input:
 *    a. Use AI to plan which tool to call
 *    b. Execute the planned tool
 *    c. Display the result
 * 4. Handle shutdown gracefully
 */
async function main() {
  // Initialize MCP client and get available tools
  const { client, toolsMeta } = await startMcp();
  let tools = toolsMeta;

  // Create interactive terminal interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt("todo: ");
  rl.prompt();

  // Handle each line of user input
  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    // Refresh tool list in case it changed
    tools = (await client.listTools()).tools;

    // Use AI to plan which tool to call
    const planned = await planAPI(input, tools);
    // BONUS: Try uncommenting this line and commenting the one above:
    // const planned = await planLibrary(input, tools);
    
    // Execute the planned tool if we got a valid plan
    if (planned?.tool) {
      const out = await callTool(client, planned.tool, planned.args || {});
      if (out.error) console.error(out.error);
      else if (out.text) console.log(out.text);
    } else {
      console.log("Could not map input to a tool.");
    }
    rl.prompt();
  });

  // Cleanup function for graceful shutdown
  const shutdown = async () => {
    await client.close();
    process.stdout.write("\n");
  };

  rl.on("close", shutdown);
  process.on("SIGINT", () => rl.close());
}

// Run the CLI application
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
