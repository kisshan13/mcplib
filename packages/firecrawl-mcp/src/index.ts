import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { registerCrawlWebsiteTool } from "./tools/crawl-website.js";
import { registerGetCrawlStatusTool } from "./tools/get-crawl-status.js";
import { registerScrapeUrlTool } from "./tools/scrape-url.js";
import { registerStartCrawlTool } from "./tools/start-crawl.js";

const mcp = new McpToolkit({
  id: "firecrawl-mcp",
  name: "firecrawl-mcp",
  displayName: "Firecrawl",
  description: "Scrape pages and crawl websites with Firecrawl.",
  version: "v1.0.0",
  serviceProvider: "firecrawl",
  capabilities: ["tools"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "direct",
    secretId: "firecrawl-api-key",
    inputSchema: z.object({
      apiKey: z.string().trim().min(1).meta({ secret: true }).describe("Your Firecrawl API key.")
    })
  })
});

registerScrapeUrlTool(mcp);
registerCrawlWebsiteTool(mcp);
registerStartCrawlTool(mcp);
registerGetCrawlStatusTool(mcp);

const register: McpToolkitRegister = mcp.asRegister();

export default register;
