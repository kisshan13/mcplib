import { McpSearch, type McpAvailabilityFilter } from "./mcp-search";

interface McpCatalogToolbarProps {
  count?: number;
  query: string;
  availability: McpAvailabilityFilter;
  onQueryChange: (query: string) => void;
  onAvailabilityChange: (availability: McpAvailabilityFilter) => void;
}

export function McpCatalogToolbar({
  count,
  query,
  availability,
  onQueryChange,
  onAvailabilityChange
}: McpCatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <p className="order-2 font-mono text-xs text-zinc-500 sm:order-1" aria-live="polite">
        {count === undefined ? "Loading MCPs..." : `${count} ${count === 1 ? "MCP" : "MCPs"}`}
      </p>
      <div className="order-1 sm:order-2">
        <McpSearch
          query={query}
          availability={availability}
          onQueryChange={onQueryChange}
          onAvailabilityChange={onAvailabilityChange}
        />
      </div>
    </div>
  );
}
