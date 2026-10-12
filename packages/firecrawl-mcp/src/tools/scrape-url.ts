import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getFirecrawlClient, withFirecrawlError } from "../client.js";

const pageResultSchema = z.object({
  result: z.record(z.string(), z.unknown()).describe("The Firecrawl page result.")
});

export function registerScrapeUrlTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "scrape-url",
    description: "Scrapes one URL and returns the requested page formats and metadata.",
    inputSchema: z.object({
      url: z.string().url().describe("The URL of the page to scrape."),
      formats: z
        .array(z.enum(["markdown", "html"]))
        .min(1)
        .default(["markdown"])
        .describe("Page formats to return.")
    }),
    outputSchema: pageResultSchema,
    async execute(input, context) {
      const firecrawl = await getFirecrawlClient(context);
      const result = await withFirecrawlError("scrape", () =>
        firecrawl.scrape(input.url, { formats: input.formats })
      );

      return { result: result as Record<string, unknown> };
    }
  });
}
