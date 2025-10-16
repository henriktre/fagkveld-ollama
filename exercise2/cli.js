#!/usr/bin/env node
// ============================================================================
// Natural Language Todo CLI with MCP and Ollama Tool Calling
// ============================================================================
// Demonstrates how to build a natural language interface using:
// - Ollama: Local AI with OpenAI-compatible tool calling
// - MCP: Model Context Protocol for standardized tool integration
// - Node.js: Interactive CLI
//
// Flow: User Input → Ollama (tool calling) → MCP Execution → Result
// ============================================================================

import readline from "readline";
import fetch from "node-fetch";
import { Client } from "@modelcontextprotocol/sdk/client";
import { Ollama } from "ollama";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Configuration
const MODEL = process.env.OLLAMA_MODEL || "gpt-oss:20b";
const HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const ENABLE_DEBUG = process.env.DEBUG === "true";
const ollama = new Ollama({ host: HOST });

// ============================================================================
// MCP SERVER INTEGRATION
// ============================================================================

/**
 * Connects to the MCP todo server and retrieves available tools.
 * MCP provides a standardized way for AI apps to interact with external tools.
 */
async function startMcp() {
  // Spawn the MCP server as a child process
  const transport = new StdioClientTransport({
    command: "node",
    args: ["todo-app/server.js"],
    stderr: "inherit",
  });

  // Connect the client
  const client = new Client({ name: "todo-cli", version: "1.0.0" });
  await client.connect(transport);
  transport.onclose = () => {};

  // Query the server for available tools (list_todos, add_todo, etc.)
  const toolsMeta = (await client.listTools()).tools;

  console.log(`✓ MCP Server connected (${toolsMeta.length} tools available)\n`);

  return { client, toolsMeta };
}

// ============================================================================
// MCP TOOL EXECUTION
// ============================================================================

/**
 * Executes an MCP tool and returns the result.
 */
async function callTool(client, name, args) {
  try {
    const result = await client.callTool({ name, arguments: args });

    if (ENABLE_DEBUG) {
      console.log("MCP Response:", JSON.stringify(result, null, 2));
    }

    if (result.isError) {
      return { error: result.content?.[0]?.text || "Unknown tool error" };
    }

    return { text: result.content?.[0]?.text };
  } catch (e) {
    return { error: `Tool execution failed: ${e.message}` };
  }
}

// ============================================================================
// AI-POWERED NATURAL LANGUAGE TO TOOL MAPPING
// ============================================================================

/**
 * Uses Ollama's tool calling to convert natural language into tool invocations.
 *
 * The model receives tool definitions in OpenAI function calling format and
 * automatically decides which tool to call with what parameters.
 */
async function planWithNativeTools(prompt, tools) {
  try {
    // Convert MCP tools to OpenAI function calling format
    const ollamaTools = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.inputSchema || {
          type: "object",
          properties: {},
          required: [],
        },
      },
    }));

    if (ENABLE_DEBUG) {
      console.log("Available tools:", JSON.stringify(ollamaTools, null, 2));
    }

    // Call Ollama with tool definitions
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful todo management assistant. Use the available tools to help users manage their todos.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      tools: ollamaTools,
      stream: false,
    });

    if (ENABLE_DEBUG) {
      console.log("Model response:", JSON.stringify(response, null, 2));
    }

    const message = response.message;

    // Check if model called a tool or responded with text
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];

      return {
        tool: toolCall.function.name,
        args: toolCall.function.arguments,
      };
    } else if (message.content) {
      console.log(`💬 ${message.content}\n`);
      return null;
    }

    return null;
  } catch (e) {
    // Check if error is about tool support
    if (e.message && e.message.includes("does not support tools")) {
      console.error(`\n❌ Model '${MODEL}' does not support tool calling.\n`);
      console.error("Supported models include:");
      console.error("  - llama3.1:8b (or larger)");
      console.error("  - llama3.2:3b (or larger)");
      console.error("  - mistral (or larger variants)");
      console.error("  - qwen2.5:7b (or larger)");
      console.error("\nInstall a compatible model:");
      console.error("  ollama pull llama3.2:3b\n");
      console.error("Then run:");
      console.error(`  OLLAMA_MODEL=llama3.2:3b node cli.js\n`);
    } else {
      console.error("❌ Planning error:", e.message);
      if (ENABLE_DEBUG) {
        console.error("Stack:", e.stack);
      }
    }
    return null;
  }
}

// ============================================================================
// INTERACTIVE CLI INTERFACE
// ============================================================================

/**
 * Main application - connects Ollama tool calling with MCP execution.
 */
async function main() {
  console.log("🚀 Natural Language Todo CLI\n");
  console.log(`Model: ${MODEL}`);
  console.log(`Host: ${HOST}`);
  console.log(
    `Debug: ${
      ENABLE_DEBUG ? "enabled" : "disabled (use DEBUG=true to enable)"
    }\n`
  );

  // Connect to MCP server and get available tools
  const { client, toolsMeta } = await startMcp();
  let tools = toolsMeta;

  console.log("✨ How it works:");
  console.log("  1. You type a command in natural language");
  console.log("  2. Ollama uses tool calling to understand what you want");
  console.log("  3. The appropriate tool is executed via MCP");
  console.log("  4. You see the result\n");

  // Create interactive prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    'Type your todo commands in natural language (or "exit" to quit)\n'
  );
  console.log("Examples:");
  console.log('  - "show my todos"');
  console.log('  - "add a todo to buy groceries"');
  console.log('  - "complete the first todo"');
  console.log('  - "what can you help me with?"\n');

  rl.setPrompt("todo> ");
  rl.prompt();

  // Handle user input
  rl.on("line", async (line) => {
    const input = line.trim();

    // Exit on empty input or exit command
    if (
      !input ||
      input.toLowerCase() === "exit" ||
      input.toLowerCase() === "quit"
    ) {
      rl.close();
      return;
    }

    // Refresh tool list
    tools = (await client.listTools()).tools;

    // Use Ollama's tool calling to determine which tool to invoke
    const planned = await planWithNativeTools(input, tools);

    // Execute the tool if one was selected
    if (planned?.tool) {
      try {
        console.log(
          `\n→ Calling: ${planned.tool}(${JSON.stringify(
            planned.args || {}
          )})\n`
        );

        const out = await callTool(client, planned.tool, planned.args || {});

        if (out.error) {
          console.error(`❌ Error: ${out.error}\n`);
        } else if (out.text) {
          console.log(`${out.text}\n`);
        }
      } catch (e) {
        console.error(`❌ Execution error: ${e.message}\n`);
      }
    } else {
      console.log(
        "❌ Could not understand the command. Please try rephrasing.\n"
      );
    }

    rl.prompt();
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n\n👋 Goodbye!");
    await client.close();
    process.exit(0);
  };

  rl.on("close", shutdown);
  process.on("SIGINT", () => rl.close());
}

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
