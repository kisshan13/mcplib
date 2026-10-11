import assert from "node:assert/strict";
import test from "node:test";
import { decryptCredential, encryptCredential } from "./credential-encryption.js";

test("credential encryption round-trips encrypted values", () => {
  process.env.MCPLIB_SECRET_ENCRYPTION_KEY = "local-test-encryption-key";

  const encrypted = encryptCredential("github-access-token");

  assert.notEqual(encrypted, "github-access-token");
  assert.equal(decryptCredential(encrypted), "github-access-token");
});

test("credential decryption rejects tampered values", () => {
  process.env.MCPLIB_SECRET_ENCRYPTION_KEY = "local-test-encryption-key";

  const encrypted = encryptCredential("github-access-token");
  const tampered = `${encrypted.slice(0, -1)}x`;

  assert.throws(() => decryptCredential(tampered));
});
