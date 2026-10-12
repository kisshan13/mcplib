import assert from "node:assert/strict";
import { test } from "node:test";
import { generateApiKey, parseApiKey, verifyApiKeySecret } from "./api-key.js";

test("generated API keys can be parsed and verified without storing the secret", () => {
  const generated = generateApiKey();
  const parsed = parseApiKey(generated.value);

  assert.ok(parsed);
  assert.equal(parsed.prefix, generated.prefix);
  assert.equal(verifyApiKeySecret(parsed.secret, generated.verifier), true);
  assert.equal(verifyApiKeySecret(`${parsed.secret}x`, generated.verifier), false);
  assert.equal(generated.verifier.includes(parsed.secret), false);
});

test("API key parser rejects malformed and legacy-looking values", () => {
  assert.equal(parseApiKey("not-a-key"), null);
  assert.equal(parseApiKey("mcpl_123_short"), null);
});
