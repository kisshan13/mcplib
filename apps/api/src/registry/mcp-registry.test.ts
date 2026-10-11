import assert from "node:assert/strict";
import test from "node:test";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { McpRegistry, McpRegistryError, resolveMcpConfiguration } from "../lib/registry.js";

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

test("MCP registry resolves scoped configuration providers without exposing them as metadata", async () => {
  const registry = new McpRegistry();
  registry.register(implementation, {
    platformConfigProvider: () => ({ clientId: "platform-client" }),
    organizationConfigProvider: (context) =>
      context.type === "organization" ? { organizationId: context.organizationId } : null
  });

  const entry = registry.get("test-mcp");
  assert.deepEqual(await resolveMcpConfiguration(entry, { type: "platform" }), {
    clientId: "platform-client"
  });
  assert.deepEqual(
    await resolveMcpConfiguration(entry, { type: "organization", organizationId: "org-1" }),
    { organizationId: "org-1" }
  );
  assert.equal("configurationProviders" in registry.list()[0], false);
});
