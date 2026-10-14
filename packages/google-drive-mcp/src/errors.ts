import { SecretProviderError } from "@packages/mcplib-core";

export type GoogleDriveErrorCode =
  | "INVALID_INPUT"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "RETRYABLE"
  | "UNSUPPORTED"
  | "API_ERROR";

export class GoogleDriveMcpError extends Error {
  constructor(
    message: string,
    readonly code: GoogleDriveErrorCode,
    readonly retryable = false
  ) {
    super(message);
    this.name = "GoogleDriveMcpError";
  }
}

export function invalidInput(message: string): never {
  throw new GoogleDriveMcpError(message, "INVALID_INPUT");
}

function getErrorDetails(error: unknown): { status?: number; message?: string; reason?: string } {
  if (typeof error !== "object" || error === null) return {};
  const value = error as {
    message?: unknown;
    response?: {
      status?: unknown;
      data?: { error?: { message?: unknown; status?: unknown; reason?: unknown } };
    };
    code?: unknown;
  };
  const apiError = value.response?.data?.error;
  return {
    status:
      typeof value.response?.status === "number"
        ? value.response.status
        : typeof value.code === "number"
          ? value.code
          : undefined,
    message:
      typeof apiError?.message === "string"
        ? apiError.message
        : typeof value.message === "string"
          ? value.message
          : undefined,
    reason: typeof apiError?.reason === "string" ? apiError.reason : undefined
  };
}

export function normalizeGoogleDriveError(operation: string, error: unknown): GoogleDriveMcpError {
  if (error instanceof GoogleDriveMcpError) return error;
  if (error instanceof SecretProviderError) {
    if (error.code === "ACCESS_DENIED") {
      return new GoogleDriveMcpError(error.message, "AUTHORIZATION_DENIED");
    }
    return new GoogleDriveMcpError(error.message, "AUTHENTICATION_REQUIRED");
  }

  const details = getErrorDetails(error);
  const status = details.status;
  const message = details.message ?? "The Google API returned an unknown error.";
  if (status === 401) {
    return new GoogleDriveMcpError(
      `Google authentication failed while attempting to ${operation}. Reconnect the Google Drive account.`,
      "AUTHENTICATION_REQUIRED"
    );
  }
  if (status === 403) {
    return new GoogleDriveMcpError(
      `Google authorization was denied while attempting to ${operation}. Check the connected account's Drive permissions and OAuth scopes.`,
      "AUTHORIZATION_DENIED"
    );
  }
  if (status === 404) {
    return new GoogleDriveMcpError(
      `The requested Google Drive resource was not found while attempting to ${operation}.`,
      "NOT_FOUND"
    );
  }
  if (status === 429) {
    return new GoogleDriveMcpError(
      `Google rate limited the request while attempting to ${operation}. Try again later.`,
      "RATE_LIMITED",
      true
    );
  }
  if (status !== undefined && status >= 500) {
    return new GoogleDriveMcpError(
      `Google Drive is temporarily unavailable while attempting to ${operation}.`,
      "RETRYABLE",
      true
    );
  }
  if (details.reason === "invalidPageToken") {
    return new GoogleDriveMcpError(
      `The Google Drive page token is invalid while attempting to ${operation}. Restart pagination from the first page.`,
      "INVALID_INPUT"
    );
  }
  return new GoogleDriveMcpError(`Google ${operation} request failed: ${message}`, "API_ERROR");
}

export async function withGoogleDriveError<T>(
  operation: string,
  request: () => Promise<T>,
  options: { retry?: boolean } = {}
): Promise<T> {
  const retry = options.retry ?? true;
  let attempt = 0;
  while (true) {
    try {
      return await request();
    } catch (error) {
      const normalized = normalizeGoogleDriveError(operation, error);
      if (!retry || !normalized.retryable || attempt >= 2) throw normalized;
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }
}
