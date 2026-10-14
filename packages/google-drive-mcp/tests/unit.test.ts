import { describe, expect, it } from "vitest";
import { createGoogleDriveClients, googleDriveScopes } from "../src/client.js";
import { GoogleDriveMcpError, normalizeGoogleDriveError } from "../src/errors.js";
import { labelValueInput } from "../src/schemas.js";
import { decodeBase64, MAX_FILE_BYTES } from "../src/validation.js";

describe("Google Drive client initialization", () => {
  it("creates separate verified v3, Activity v2, and Labels v2 clients", () => {
    const clients = createGoogleDriveClients("Bearer test-token");
    expect(clients.drive).toBeDefined();
    expect(clients.activity).toBeDefined();
    expect(clients.labels).toBeDefined();
    expect(googleDriveScopes).toContain("https://www.googleapis.com/auth/drive.activity");
  });
});

describe("Google Drive validation and errors", () => {
  it("rejects malformed and oversized content before an API call", () => {
    expect(() => decodeBase64("not base64")).toThrow("padded base64");
    const oversized = Buffer.alloc(MAX_FILE_BYTES + 1).toString("base64");
    expect(() => decodeBase64(oversized)).toThrow("8388608-byte");
  });

  it("validates label values by declared field type", () => {
    expect(labelValueInput.safeParse({ valueType: "integer", values: [3, 7] }).success).toBe(true);
    expect(labelValueInput.safeParse({ valueType: "integer", values: ["3"] }).success).toBe(false);
    expect(
      labelValueInput.safeParse({ valueType: "dateString", values: ["2026-10-14"] }).success
    ).toBe(true);
  });

  it("normalizes authorization and rate-limit responses without leaking response details", () => {
    const denied = normalizeGoogleDriveError("list files", {
      response: { status: 403, data: { error: { message: "private detail" } } }
    });
    expect(denied).toBeInstanceOf(GoogleDriveMcpError);
    expect(denied.code).toBe("AUTHORIZATION_DENIED");
    expect(denied.message).not.toContain("private detail");
    const limited = normalizeGoogleDriveError("list files", { response: { status: 429 } });
    expect(limited.code).toBe("RATE_LIMITED");
    expect(limited.retryable).toBe(true);
  });
});
