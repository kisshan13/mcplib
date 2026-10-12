import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getFirecrawlClient, withFirecrawlError } from "../client.js";

export function registerStartCrawlTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "start-crawl",
    description:
      "Starts an asynchronous website crawl and returns its job ID for use with get-crawl-status.",
    inputSchema: z.object({
      url: z.string().url().describe("The starting URL for the website crawl."),
      limit: z.number().int().positive().default(100).describe("Maximum pages to crawl.")
    }),
    outputSchema: z.object({ id: z.string().min(1).describe("The Firecrawl crawl job ID.") }),
    async execute(input, context) {
      const firecrawl = await getFirecrawlClient(context);
      const result = await withFirecrawlError("start crawl", () =>
        firecrawl.startCrawl(input.url, { limit: input.limit })
      );

      if (!result.id) {
        throw new Error("Firecrawl start crawl request did not return a job ID.");
      }

      return { id: result.id };
    }
  });
}
