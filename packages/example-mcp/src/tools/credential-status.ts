import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";

export function registerCredentialStatusTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "credential-status",
    description: "Checks whether the platform authorized this MCP to use its example credential.",
    inputSchema: z.object({}),
    outputSchema: z.object({ configured: z.boolean() }),
    async execute(_input, context) {
      await context.secretProvider.getSecret({
        integrationId: "example-mcp",
        serviceProvider: "example-service",
        secretId: "default",
        operation: "use",
        purpose: "credential-status-tool",
        userId: context.userId,
        organizationId: context.organizationId,
        externalUserIdentity: context.externalUserIdentity
      });

      return { configured: true };
    }
  });
}
