import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.js";

const algorithm = "aes-256-gcm";
const version = "v1";

function getKey(): Buffer {
  const configuredKey =
    env.MCPLIB_SECRET_ENCRYPTION_KEY ?? process.env.MCPLIB_SECRET_ENCRYPTION_KEY;
  if (!configuredKey) {
    throw new Error("MCPLIB_SECRET_ENCRYPTION_KEY is not configured.");
  }

  return createHash("sha256").update(configuredKey).digest();
}

export function encryptCredential(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    version,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url")
  ].join(".");
}

export function decryptCredential(value: string): string {
  const [storedVersion, encodedIv, encodedTag, encodedCiphertext] = value.split(".");

  if (storedVersion !== version || !encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("The stored credential has an unsupported format.");
  }

  const decipher = createDecipheriv(algorithm, getKey(), Buffer.from(encodedIv, "base64url"));
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final()
  ]).toString("utf8");
}
