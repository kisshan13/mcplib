import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getFirecrawlClient, withFirecrawlError } from "../client.js";

export function registerGetCrawlStatusTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "get-crawl-status",
    description: "Checks a Firecrawl crawl job and returns its status and any available results.",
    inputSchema: z.object({ id: z.string().trim().min(1).describe("The crawl job ID to check.") }),
    outputSchema: z.object({
      result: z.record(z.string(), z.unknown()).describe("The current crawl status and results.")
    }),
    async execute(input, context) {
      const firecrawl = await getFirecrawlClient(context);
      const result = await withFirecrawlError("get crawl status", () =>
        firecrawl.getCrawlStatus(input.id)
      );

      return { result: result as unknown as Record<string, unknown> };
    }
  });
}
