import type { Request, Response } from "express";
import { z } from "zod";
import { decryptCredential, encryptCredential } from "../lib/credential-encryption.js";
import type { PlatformMcpOAuthState } from "./types.js";

const cookieName = "mcplib_mcp_oauth_state";
const maxAgeSeconds = 10 * 60;

const stateSchema = z.object({
  state: z.string().min(1),
  codeVerifier: z.string().min(1),
  mcpId: z.string().min(1),
  userId: z.string().min(1),
  redirectUri: z.string().url(),
  createdAt: z.number().int().positive()
});

function readCookies(request: Request): Record<string, string> {
  return Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        return separator === -1
          ? [part, ""]
          : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      })
  );
}

function cookieAttributes(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Max-Age=${maxAgeSeconds}; Path=/api/v1/mcps; HttpOnly; SameSite=Lax${secure}`;
}

export function setPlatformMcpOAuthState(response: Response, state: PlatformMcpOAuthState): void {
  const value = encodeURIComponent(encryptCredential(JSON.stringify(state)));
  response.setHeader("Set-Cookie", `${cookieName}=${value}; ${cookieAttributes()}`);
}

export function getPlatformMcpOAuthState(request: Request): PlatformMcpOAuthState | null {
  const encodedValue = readCookies(request)[cookieName];
  if (!encodedValue) return null;

  try {
    const value = stateSchema.parse(JSON.parse(decryptCredential(encodedValue)));
    if (Date.now() - value.createdAt > maxAgeSeconds * 1000) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearPlatformMcpOAuthState(response: Response): void {
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=; Max-Age=0; Path=/api/v1/mcps; HttpOnly; SameSite=Lax`
  );
}
