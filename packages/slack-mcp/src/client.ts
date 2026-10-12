import { McpRuntimeContext } from "@packages/mcp-core";
import { SecretProviderError } from "@packages/mcplib-core";
import { WebClient } from "@slack/web-api";

const slackSecretRequest = {
  integrationId: "slack-mcp",
  serviceProvider: "slack",
  secretId: "slack-oauth",
  operation: "use" as const,
  purpose: "slack-tool"
};

export async function getSlackClient(context: McpRuntimeContext): Promise<WebClient> {
  const secret = await context.secretProvider.getSecret({
    ...slackSecretRequest,
    userId: context.userId,
    organizationId: context.organizationId,
    externalUserIdentity: context.externalUserIdentity
  });

  if (secret.type !== "header" || secret.secretType !== "bearer" || !secret.value) {
    throw new SecretProviderError(
      "The configured Slack credential is not a bearer token.",
      "UNAVAILABLE"
    );
  }

  const token = secret.value.replace(/^Bearer\s+/i, "");
  if (!token.trim()) {
    throw new SecretProviderError("The configured Slack access token is empty.", "UNAVAILABLE");
  }

  return new WebClient(token);
}

export async function withSlackError<T>(operation: string, request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Slack API error.";
    throw new Error(`Slack ${operation} request failed: ${message}`, { cause: error });
  }
}
