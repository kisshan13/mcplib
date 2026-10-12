import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getSlackClient, withSlackError } from "../client.js";

export function registerGetThreadRepliesTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "get-thread-replies",
    description: "Retrieves a Slack message thread, including its parent message and replies.",
    inputSchema: z.object({
      channelId: z.string().trim().min(1).describe("The Slack conversation ID."),
      threadTs: z.string().trim().min(1).describe("The timestamp of the parent message."),
      limit: z
        .number()
        .int()
        .positive()
        .max(15)
        .default(15)
        .describe("Maximum messages to return."),
      cursor: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe("Cursor for the next page of thread messages.")
    }),
    outputSchema: z.object({
      result: z.record(z.string(), z.unknown()).describe("The thread messages and pagination data.")
    }),
    async execute(input, context) {
      const slack = await getSlackClient(context);
      const result = await withSlackError("get thread replies", () =>
        slack.conversations.replies({
          channel: input.channelId,
          ts: input.threadTs,
          limit: input.limit,
          cursor: input.cursor
        })
      );

      return { result: result as unknown as Record<string, unknown> };
    }
  });
}
