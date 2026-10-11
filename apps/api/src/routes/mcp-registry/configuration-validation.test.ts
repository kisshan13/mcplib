import assert from "node:assert/strict";
import test from "node:test";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { ApiError } from "../../lib/error.js";
import {
  sanitizeStoredConfigurationValues,
  validateAndSanitizeConfigurationValues,
  validateDirectCredentialValue
} from "./configuration-validation.js";
import { validatorMcpConfigurationBody, validatorMcpConfigurationQuery } from "./validator.js";

const configuration = new SecretProviderConfiguration({
  type: "configuration",
  secretId: "google-oauth",
  inputSchema: z.object({
    clientId: z.string().min(1),
    clientSecret: z.string().min(1).meta({ secret: true })
  })
});

test("validates and stores only non-secret MCP configuration values", () => {
  assert.deepEqual(
    validateAndSanitizeConfigurationValues(configuration, { clientId: "client-id" }),
    { clientId: "client-id" }
  );
});

test("rejects secret values from MCP configuration persistence", () => {
  assert.throws(
    () =>
      validateAndSanitizeConfigurationValues(configuration, {
        clientId: "client-id",
        clientSecret: "secret-value"
      }),
    (error: unknown) => error instanceof ApiError && error.status === 422
  );
});

test("rejects invalid configuration fields", () => {
  assert.throws(
    () => validateAndSanitizeConfigurationValues(configuration, { unsupported: true }),
    (error: unknown) => error instanceof ApiError && error.status === 422
  );
});

test("does not return secret fields from stored values", () => {
  assert.deepEqual(
    sanitizeStoredConfigurationValues(configuration, {
      clientId: "client-id",
      clientSecret: "should-not-be-returned"
    }),
    { clientId: "client-id" }
  );
});

test("validates a direct credential without persisting its secret value", () => {
  const directConfiguration = new SecretProviderConfiguration({
    type: "direct",
    secretId: "firecrawl-api-key",
    inputSchema: z.object({
      apiKey: z.string().min(1).meta({ secret: true })
    })
  });

  assert.equal(
    validateDirectCredentialValue(directConfiguration, { apiKey: "firecrawl-secret" }),
    "firecrawl-secret"
  );
});

test("requires organization IDs for organization configuration contexts", () => {
  assert.throws(() => validatorMcpConfigurationQuery.parse({ context: "organization" }));
  assert.throws(() =>
    validatorMcpConfigurationQuery.parse({ context: "platform", organizationId: "org-1" })
  );

  assert.deepEqual(
    validatorMcpConfigurationBody.parse({
      context: { type: "organization", id: "org-1" },
      values: {}
    }).context,
    { type: "organization", id: "org-1" }
  );
});
