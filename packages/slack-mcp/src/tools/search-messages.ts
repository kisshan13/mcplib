import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getSlackClient, withSlackError } from "../client.js";

export function registerSearchMessagesTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "search-messages",
    description:
      "Searches Slack messages for the connected user and returns matching messages with context and permalinks.",
    inputSchema: z.object({
      query: z.string().trim().min(1).describe("A keyword or natural-language Slack search query."),
      limit: z.number().int().positive().max(20).default(10).describe("Maximum results to return."),
      channelTypes: z
        .array(z.enum(["public_channel", "private_channel", "mpim", "im"]))
        .min(1)
        .default(["public_channel", "private_channel", "mpim", "im"])
        .describe("Conversation types to search.")
    }),
    outputSchema: z.object({
      result: z
        .record(z.string(), z.unknown())
        .describe("Slack search results and pagination data.")
    }),
    async execute(input, context) {
      const slack = await getSlackClient(context);
      const result = await withSlackError("search messages", () =>
        slack.apiCall("assistant.search.context", {
          query: input.query,
          limit: input.limit,
          channel_types: input.channelTypes,
          include_context_messages: true
        })
      );

      return { result: result as unknown as Record<string, unknown> };
    }
  });
}
