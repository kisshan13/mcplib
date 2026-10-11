import { McpToolkit, type McpRuntimeContext } from "@packages/mcp-core";
import { SecretProviderError } from "@packages/mcplib-core";
import { Octokit } from "octokit";
import { z } from "zod";

const githubSecretRequest = {
  integrationId: "github-mcp",
  serviceProvider: "github",
  secretId: "github-oauth",
  operation: "use" as const,
  purpose: "authenticated-user-tool"
};

async function getGithubClient(context: McpRuntimeContext): Promise<Octokit> {
  const secret = await context.secretProvider.getSecret({
    ...githubSecretRequest,
    userId: context.userId,
    organizationId: context.organizationId,
    externalUserIdentity: context.externalUserIdentity
  });

  if (secret.type !== "header" || secret.secretType !== "bearer" || !secret.value) {
    throw new SecretProviderError(
      "The configured GitHub credential is not a bearer token.",
      "UNAVAILABLE"
    );
  }

  return new Octokit({ auth: secret.value.replace(/^Bearer\s+/i, "") });
}

export function registerAuthenticatedUserTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "authenticated-user",
    description: "Returns the GitHub user associated with the current MCP connection.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      id: z.number(),
      login: z.string(),
      name: z.string().nullable(),
      htmlUrl: z.string()
    }),
    async execute(_input, context) {
      const github = await getGithubClient(context);
      const { data } = await github.rest.users.getAuthenticated();

      return {
        id: data.id,
        login: data.login,
        name: data.name,
        htmlUrl: data.html_url
      };
    }
  });
}
