import assert from "node:assert/strict";
import test from "node:test";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { McpRegistry, McpRegistryError } from "./mcp-registry.js";

const metadata = {
  id: "test-mcp",
  name: "test-mcp",
  displayName: "Test MCP",
  capabilities: ["tools"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "direct",
    secretId: "test-api-key",
    inputSchema: z.object({ apiKey: z.string() })
  }),
  available: true
};

const implementation = {
  metadata,
  tools: [
    {
      name: "search",
      description: "Searches records",
      inputSchema: { type: "object" },
      outputSchema: { type: "object" }
    }
  ],
  register: async () => undefined
};

test("MCP registry lists and retrieves public metadata", () => {
  const registry = new McpRegistry();

  registry.register(implementation);

  assert.deepEqual(registry.get("test-mcp").metadata, metadata);
  assert.deepEqual(registry.list(), [metadata]);
});

test("MCP registry rejects duplicates and unknown identifiers", () => {
  const registry = new McpRegistry();
  registry.register(implementation);

  assert.throws(
    () => registry.register(implementation),
    (error: unknown) => error instanceof McpRegistryError && error.code === "DUPLICATE"
  );
  assert.throws(
    () => registry.get("missing-mcp"),
    (error: unknown) => error instanceof McpRegistryError && error.code === "UNKNOWN"
  );
});

test("MCP registry lists tools without exposing the runtime handler", () => {
  const registry = new McpRegistry();

  registry.register(implementation);

  assert.deepEqual(registry.listTools("test-mcp"), implementation.tools);
  assert.equal("register" in registry.listTools("test-mcp")[0], false);
});
