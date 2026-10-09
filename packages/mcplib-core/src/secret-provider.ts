export interface Secret {
  type: "header";
  secretType: "bearer" | "basic";

  name?: string;
  value?: string;
  username?: string;
  password?: string;
}

export type SecretOperation = "read" | "use";

export interface SecretAccessContext {
  userId?: string;
  organizationId?: string;
  externalUserIdentity?: string;
}

export interface SecretRequest extends SecretAccessContext {
  integrationId: string;
  secretId: string;
  serviceProvider?: string;
  operation?: SecretOperation;
  purpose?: string;
}

export class SecretProviderError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "ACCESS_DENIED" | "UNAVAILABLE" = "UNAVAILABLE"
  ) {
    super(message);
    this.name = "SecretProviderError";
  }
}

export interface SecretProvider {
  getSecret: (request: SecretRequest) => Promise<Secret>;
}

export const unavailableSecretProvider: SecretProvider = {
  async getSecret() {
    throw new SecretProviderError(
      "No secret provider is configured for this MCP runtime.",
      "UNAVAILABLE"
    );
  }
};
