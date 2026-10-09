import assert from "node:assert/strict";
import test from "node:test";
import { SecretProviderError, type SecretRequest } from "@packages/mcplib-core";
import { createDatabaseSecretProvider } from "./secret-provider.js";

const request: SecretRequest = {
  integrationId: "example-mcp",
  serviceProvider: "example-service",
  secretId: "secret-1",
  userId: "user-1",
  operation: "use"
};

test("database secret provider returns only an authorized decrypted secret", async () => {
  const provider = createDatabaseSecretProvider({
    decrypt: async (value) => `decrypted:${value}`,
    findToken: async () => ({ accessTokenEncrypted: "ciphertext" })
  });

  const secret = await provider.getSecret(request);

  assert.equal(secret.value, "Bearer decrypted:ciphertext");
});

test("database secret provider rejects requests without an identity context", async () => {
  const provider = createDatabaseSecretProvider({
    decrypt: async (value) => value,
    findToken: async () => ({ accessTokenEncrypted: "ciphertext" })
  });

  await assert.rejects(
    provider.getSecret({
      integrationId: request.integrationId,
      secretId: request.secretId
    }),
    (error: unknown) => error instanceof SecretProviderError && error.code === "ACCESS_DENIED"
  );
});

test("database secret provider reports missing credentials predictably", async () => {
  const provider = createDatabaseSecretProvider({
    decrypt: async (value) => value,
    findToken: async () => null
  });

  await assert.rejects(
    provider.getSecret(request),
    (error: unknown) => error instanceof SecretProviderError && error.code === "NOT_FOUND"
  );
});
