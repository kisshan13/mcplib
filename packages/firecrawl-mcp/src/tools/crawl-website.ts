import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { getFirecrawlClient, withFirecrawlError } from "../client.js";

const resultSchema = z.object({
  result: z.record(z.string(), z.unknown()).describe("The completed Firecrawl crawl result.")
});

const crawlInputSchema = z.object({
  url: z.string().url().describe("The starting URL for the website crawl."),
  limit: z.number().int().positive().default(100).describe("Maximum pages to crawl."),
  formats: z
    .array(z.enum(["markdown", "html"]))
    .min(1)
    .default(["markdown"])
    .describe("Page formats to return for each crawled page."),
  sitemapOnly: z
    .boolean()
    .default(false)
    .describe("When true, discover pages from the site's sitemap only.")
});

export function registerCrawlWebsiteTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "crawl-website",
    description:
      "Crawls a website and waits for the completed results. Use start-crawl for long-running jobs.",
    inputSchema: crawlInputSchema,
    outputSchema: resultSchema,
    async execute(input, context) {
      const firecrawl = await getFirecrawlClient(context);
      const result = await withFirecrawlError("crawl", () =>
        firecrawl.crawl(input.url, {
          limit: input.limit,
          sitemap: input.sitemapOnly ? "only" : undefined,
          scrapeOptions: { formats: input.formats }
        })
      );

      return { result: result as unknown as Record<string, unknown> };
    }
  });
}
