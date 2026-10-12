import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const API_KEY_PREFIX = "mcpl";

type GeneratedApiKey = {
  value: string;
  prefix: string;
  verifier: string;
};

export function generateApiKey(): GeneratedApiKey {
  const prefix = randomBytes(8).toString("hex");
  const secret = randomBytes(32).toString("base64url");
  return {
    value: `${API_KEY_PREFIX}_${prefix}_${secret}`,
    prefix,
    verifier: hashApiKeySecret(secret)
  };
}

export function parseApiKey(value: string): { prefix: string; secret: string } | null {
  const match = new RegExp(`^${API_KEY_PREFIX}_([a-f0-9]{16})_([A-Za-z0-9_-]{40,})$`).exec(value);
  return match ? { prefix: match[1], secret: match[2] } : null;
}

export function hashApiKeySecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function verifyApiKeySecret(secret: string, verifier: string): boolean {
  const actual = Buffer.from(hashApiKeySecret(secret), "hex");
  const expected = Buffer.from(verifier, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function getPresentedApiKey(request: {
  headers: Record<string, string | string[] | undefined>;
}): string | null {
  const header = request.headers["x-api-key"];
  if (typeof header === "string" && header.trim()) return header.trim();

  const authorization = request.headers.authorization;
  if (typeof authorization !== "string") return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}
