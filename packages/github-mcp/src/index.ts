import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { registerAuthenticatedUserTool } from "./tools/authenticated-user.js";

const mcp = new McpToolkit({
  id: "github-mcp",
  name: "github-mcp",
  displayName: "GitHub MCP",
  description: "Access GitHub through tools powered by the current user's OAuth connection.",
  version: "v1.0.0",
  serviceProvider: "github",
  capabilities: ["tools"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "configuration",
    secretId: "github-oauth",
    inputSchema: z.object({
      clientId: z.string().min(1).describe("The GitHub OAuth application client ID."),
      clientSecret: z
        .string()
        .min(1)
        .meta({ secret: true })
        .describe("The GitHub OAuth application client secret.")
    }),
    oauth: {
      issuer: "https://github.com/login/oauth",
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      scopes: ["read:user", "user:email"]
    }
  })
});

registerAuthenticatedUserTool(mcp);

const register: McpToolkitRegister = mcp.asRegister();

export default register;
