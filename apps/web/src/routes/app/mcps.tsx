import { createFileRoute } from "@tanstack/react-router";
import { McpCatalog } from "@/components/mcps/mcp-catalog";

export const Route = createFileRoute("/app/mcps")({
  head: () => ({
    meta: [{ title: "MCP Catalog | MCPLib" }]
  }),
  component: McpsRoute
});

function McpsRoute() {
  return <McpCatalog />;
}
