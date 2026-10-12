import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getSlackClient, withSlackError } from "../client.js";

export function registerPinMessageTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "pin-message",
    description: "Pins an existing Slack message to its channel.",
    inputSchema: z.object({
      channelId: z.string().trim().min(1).describe("The Slack channel ID containing the message."),
      messageTs: z.string().trim().min(1).describe("The timestamp of the message to pin.")
    }),
    outputSchema: z.object({
      pinned: z.literal(true),
      channelId: z.string(),
      messageTs: z.string()
    }),
    async execute(input, context) {
      const slack = await getSlackClient(context);
      const result = await withSlackError("pin message", () =>
        slack.pins.add({ channel: input.channelId, timestamp: input.messageTs })
      );

      if (!result.ok) {
        throw new Error("Slack did not confirm that the message was pinned.");
      }

      return {
        pinned: true as const,
        channelId: input.channelId,
        messageTs: input.messageTs
      };
    }
  });
}
