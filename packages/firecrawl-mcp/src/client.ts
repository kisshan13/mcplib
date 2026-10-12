import { McpRuntimeContext } from "@packages/mcp-core";
import { SecretProviderError } from "@packages/mcplib-core";
import { Firecrawl } from "firecrawl";

const firecrawlSecretRequest = {
  integrationId: "firecrawl-mcp",
  serviceProvider: "firecrawl",
  secretId: "firecrawl-api-key",
  operation: "use" as const,
  purpose: "firecrawl-tool"
};

export async function getFirecrawlClient(context: McpRuntimeContext): Promise<Firecrawl> {
  const secret = await context.secretProvider.getSecret({
    ...firecrawlSecretRequest,
    userId: context.userId,
    organizationId: context.organizationId,
    externalUserIdentity: context.externalUserIdentity
  });

  if (secret.type !== "header" || secret.secretType !== "bearer" || !secret.value) {
    throw new SecretProviderError(
      "The configured Firecrawl credential is not an API key.",
      "UNAVAILABLE"
    );
  }

  const apiKey = secret.value.replace(/^Bearer\s+/i, "");
  if (!apiKey.trim()) {
    throw new SecretProviderError("The configured Firecrawl API key is empty.", "UNAVAILABLE");
  }

  return new Firecrawl({ apiKey });
}

export async function withFirecrawlError<T>(
  operation: string,
  request: () => Promise<T>
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Firecrawl API error.";
    throw new Error(`Firecrawl ${operation} request failed: ${message}`, { cause: error });
  }
}
