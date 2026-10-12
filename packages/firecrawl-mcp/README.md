# `@packages/firecrawl-mcp`

Firecrawl MCP provides tools for scraping pages and crawling websites through the Firecrawl Node SDK.

## Configuration

Configure a Firecrawl API key for this MCP in the platform's MCP settings. The key is stored as a direct credential and supplied to the SDK when a tool runs. The credential is never included in tool inputs or results.

The credential uses the `apiKey` field and requires a Firecrawl API key. The SDK documentation also supports `FIRECRAWL_API_KEY` when using the SDK directly; this MCP uses the repository's per-user or per-organization credential provider instead.

## Tools

| Tool               | Description                                             | Inputs                                                                      |
| ------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `scrape-url`       | Scrapes a single page.                                  | `url`; optional `formats` (`markdown` or `html`, default `markdown`).       |
| `crawl-website`    | Crawls a website and waits for the results.             | `url`; optional page `limit` (default `100`), `formats`, and `sitemapOnly`. |
| `start-crawl`      | Starts an asynchronous crawl and returns its job ID.    | `url`; optional page `limit` (default `100`).                               |
| `get-crawl-status` | Retrieves the status and available results for a crawl. | `id`, the job ID returned by `start-crawl`.                                 |

Use `crawl-website` for a crawl that should complete in one request. For long-running crawls, call `start-crawl` and then use `get-crawl-status` with the returned ID.

## Development

From the repository root:

```bash
pnpm --filter @packages/firecrawl-mcp typecheck
pnpm --filter @packages/firecrawl-mcp build
```

The API imports this package in `apps/api/src/registry/mcp-registry.ts`, where it becomes discoverable through the shared MCP registry.
