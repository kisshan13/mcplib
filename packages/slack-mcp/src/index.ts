import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { registerGetThreadRepliesTool } from "./tools/get-thread-replies.js";
import { registerPinMessageTool } from "./tools/pin-message.js";
import { registerSearchMessagesTool } from "./tools/search-messages.js";
import { registerSendMessageTool } from "./tools/send-message.js";

const mcp = new McpToolkit({
  id: "slack-mcp",
  name: "slack-mcp",
  displayName: "Slack",
  description: "Search Slack messages, read threads, and send messages as the connected user.",
  version: "v1.0.0",
  serviceProvider: "slack",
  capabilities: ["tools"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "configuration",
    secretId: "slack-oauth",
    inputSchema: z.object({
      clientId: z.string().trim().min(1).describe("The Slack app client ID."),
      clientSecret: z
        .string()
        .min(1)
        .meta({ secret: true })
        .describe("The Slack app client secret.")
    }),
    oauth: {
      issuer: "https://slack.com",
      authorizationUrl: "https://slack.com/oauth/v2_user/authorize",
      tokenUrl: "https://slack.com/api/oauth.v2.user.access",
      scopes: [
        "search:read.public",
        "search:read.private",
        "search:read.mpim",
        "search:read.im",
        "channels:history",
        "groups:history",
        "im:history",
        "mpim:history",
        "chat:write",
        "pins:write"
      ]
    }
  })
});

registerSearchMessagesTool(mcp);
registerGetThreadRepliesTool(mcp);
registerSendMessageTool(mcp);
registerPinMessageTool(mcp);

const register: McpToolkitRegister = mcp.asRegister();

export default register;
