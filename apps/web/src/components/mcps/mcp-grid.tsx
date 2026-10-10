import type { McpMetadata } from "@/core-api/types/mcp-registry";
import { McpCard } from "./mcp-card";

export function McpGrid({ mcps }: { mcps: McpMetadata[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {mcps.map((mcp) => (
        <McpCard key={mcp.id} mcp={mcp} />
      ))}
    </div>
  );
}
