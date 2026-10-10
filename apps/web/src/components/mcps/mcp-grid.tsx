import type { McpMetadata } from "@/core-api/types/mcp-registry";
import { McpCard } from "./mcp-card";

interface McpGridProps {
  mcps: McpMetadata[];
  onSelect?: (mcp: McpMetadata) => void;
}

export function McpGrid({ mcps, onSelect }: McpGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {mcps.map((mcp) => (
        <McpCard key={mcp.id} mcp={mcp} onSelect={onSelect} />
      ))}
    </div>
  );
}
