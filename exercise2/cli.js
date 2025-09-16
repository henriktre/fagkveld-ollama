#!/usr/bin/env node
import readline from "readline";
import fetch from "node-fetch";
import { Client } from "@modelcontextprotocol/sdk/client";
import { Ollama } from "ollama";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const MODEL = process.env.OLLAMA_MODEL || "gpt-oss:20b";
const HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const ollama = new Ollama({ host: HOST });

/**
 * Starts the MCP todo server process via stdio and returns an initialized client.
 * @returns {Promise<{client: import('@modelcontextprotocol/sdk/client').Client, toolsMeta: Array<any>}>}
 */
async function startMcp() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["todo-app/server.js"],
    stderr: "inherit",
  });
  const client = new Client({ name: "todo-cli", version: "0.3.1" });
  await client.connect(transport);
  transport.onclose = () => {};
  const toolsMeta = (await client.listTools()).tools;
  return { client, toolsMeta };
}

/**
 * Calls an MCP tool and unwraps a simple {text} or {error} object.
 * @param {any} client MCP Client instance
 * @param {string} name Tool name
 * @param {Record<string,any>} args Arguments for the tool
 * @returns {Promise<{text?: string, error?: string}>}
 */
async function callTool(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError)
    return { error: result.content?.[0]?.text || "Unknown tool error" };
  return { text: result.content?.[0]?.text };
}

/**
 * Plans a tool invocation from natural language using an Ollama model.
 * @param {string} prompt User natural language input
 * @param {Array<any>} tools Current list of tool metadata
 * @returns {Promise<{tool: string, args?: Record<string,any>} | null>} Planned tool invocation or null
 */
async function planAPI(prompt, tools) {
  const list = tools
    .map((t) => `${t.name}: ${t.description || ""}`.trim())
    .join("\n");
  const sys = `Map the user request to one MCP todo tool.\nTools:\n${list}\nReturn JSON {"tool":"name","args":{}}.`;
  try {
    const res = await fetch(`${HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${sys}\nUser: ${prompt}\nAssistant:`,
        stream: false,
      }),
    });
    const json = await res.json();
    const match = (json.response || "").match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Same as plan() but uses the official ollama-js client instead of raw fetch.
 * Falls back to null if any parsing / API issue occurs.
 * @param {string} prompt User natural language input
 * @param {Array<any>} tools Current list of tool metadata
 * @returns {Promise<{tool: string, args?: Record<string,any>} | null>}
 */
async function planLibrary(prompt, tools) {
  const list = tools
    .map((t) => `${t.name}: ${t.description || ""}`.trim())
    .join("\n");
  const sys = `Map the user request to one MCP todo tool.\nTools:\n${list}\nReturn JSON {"tool":"name","args":{}}.`;
  try {
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

/**
 * Entrypoint: starts MCP client, runs interactive loop mapping natural language to tools.
 * Handles graceful shutdown on EOF / SIGINT.
 */
async function main() {
  const { client, toolsMeta } = await startMcp();
  let tools = toolsMeta;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt("todo: ");
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    tools = (await client.listTools()).tools;

    const planned = await planAPI(input, tools);
    // const planned = await planLibrary(input, tools);
    if (planned?.tool) {
      const out = await callTool(client, planned.tool, planned.args || {});
      if (out.error) console.error(out.error);
      else if (out.text) console.log(out.text);
    } else {
      console.log("Could not map input to a tool.");
    }
    rl.prompt();
  });

  const shutdown = async () => {
    await client.close();
    process.stdout.write("\n");
  };

  rl.on("close", shutdown);
  process.on("SIGINT", () => rl.close());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
