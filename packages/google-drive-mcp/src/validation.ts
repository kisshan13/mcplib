import { z } from "zod";
import { invalidInput } from "./errors.js";

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_PAGE_SIZE = 1000;

export const idSchema = z.string().trim().min(1).max(512);
export const pageSizeSchema = z.number().int().min(1).max(MAX_PAGE_SIZE).default(100);
export const pageTokenSchema = z.string().trim().min(1).max(4096).optional();
export const fieldsSchema = z.string().trim().min(1).max(4000).optional();
export const mimeTypeSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[^\s/]+\/[^\s/]+$/, "mimeType must be a valid MIME type");
export const dateTimeSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Expected an RFC 3339-compatible date/time."
  });
export const emailSchema = z.string().trim().email().max(320);
export const resultSchema = z.object({ result: z.unknown() });

export function decodeBase64(value: string): Buffer {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) {
    invalidInput("contentBase64 must be a padded base64 string.");
  }
  const content = Buffer.from(value, "base64");
  if (content.byteLength > MAX_FILE_BYTES) {
    invalidInput(`File content exceeds the ${MAX_FILE_BYTES}-byte MCP limit.`);
  }
  return content;
}

export function assertFileName(name: string): string {
  const normalized = name.trim();
  if (
    !normalized ||
    normalized.length > 255 ||
    [...normalized].some((character) => character.charCodeAt(0) < 32)
  ) {
    invalidInput("File names must be 1-255 characters and cannot contain control characters.");
  }
  return normalized;
}

export function assertDateTime(value: string | undefined, name: string): void {
  if (value !== undefined && Number.isNaN(Date.parse(value))) invalidInput(`${name} is invalid.`);
}
