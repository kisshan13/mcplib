import { createFileRoute } from "@tanstack/react-router";
import { McpSettingsPage } from "@/components/settings/mcp-settings-page";

export const Route = createFileRoute("/app/settings/mcps")({
  head: () => ({ meta: [{ title: "MCP Connections | MCPLib" }] }),
  component: McpSettingsRoute
});

function McpSettingsRoute() {
  return <McpSettingsPage />;
}
