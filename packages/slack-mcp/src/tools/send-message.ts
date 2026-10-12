import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getSlackClient, withSlackError } from "../client.js";

export function registerSendMessageTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "send-message",
    description: "Posts a text message to a Slack channel or conversation as the connected user.",
    inputSchema: z.object({
      channelId: z.string().trim().min(1).describe("The destination Slack conversation ID."),
      text: z.string().trim().min(1).describe("The message text to send.")
    }),
    outputSchema: z.object({
      channelId: z.string(),
      timestamp: z.string().describe("The timestamp of the posted message.")
    }),
    async execute(input, context) {
      const slack = await getSlackClient(context);
      const result = await withSlackError("send message", () =>
        slack.chat.postMessage({ channel: input.channelId, text: input.text })
      );

      if (!result.ok || !result.ts) {
        throw new Error("Slack accepted no message timestamp in the post response.");
      }

      return {
        channelId: result.channel ?? input.channelId,
        timestamp: result.ts
      };
    }
  });
}
