import assert from "node:assert/strict";
import test from "node:test";
import { McpToolkit } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";

test("direct configuration describes a secret the MCP can use directly", () => {
  const configuration = new SecretProviderConfiguration({
    type: "direct",
    secretId: "firecrawl-api-key",
    inputSchema: z.object({ apiKey: z.string().min(1) })
  });

  assert.equal(configuration.type, "direct");
  assert.equal(configuration.secretId, "firecrawl-api-key");
  assert.deepEqual(configuration.inputSchema.required, ["apiKey"]);
});

test("configuration type describes OAuth setup without storing credentials", () => {
  const configuration = new SecretProviderConfiguration({
    type: "configuration",
    secretId: "google-oauth",
    inputSchema: z.object({
      clientId: z.string(),
      clientSecret: z.string()
    }),
    oauth: {
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["drive.readonly"]
    }
  });

  assert.equal(configuration.type, "configuration");
  assert.deepEqual(configuration.oauth?.scopes, ["drive.readonly"]);
  assert.equal("clientSecretValue" in configuration, false);
});

test("configuration rejects non-object input schemas", () => {
  assert.throws(
    () =>
      new SecretProviderConfiguration({
        type: "direct",
        secretId: "invalid",
        inputSchema: z.string()
      }),
    /inputSchema must describe an object/
  );
});

test("McpToolkit exposes a cloned secret provider configuration in metadata", () => {
  const configuration = new SecretProviderConfiguration({
    type: "direct",
    secretId: "firecrawl-api-key",
    inputSchema: z.object({ apiKey: z.string() })
  });
  const mcp = new McpToolkit({
    name: "firecrawl-mcp",
    version: "1.0.0",
    secretProviderConfiguration: configuration
  });

  const metadata = mcp.getMetadata();

  assert.notEqual(metadata.secretProviderConfiguration, configuration);
  assert.equal(metadata.secretProviderConfiguration?.secretId, "firecrawl-api-key");
  assert.deepEqual(metadata.secretProviderConfiguration?.inputSchema.required, ["apiKey"]);
});
