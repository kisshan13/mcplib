import { useMemo, useState } from "react";
import { useMcpRegistryQuery } from "@/hooks/query/use-mcp-registry-query";
import { McpCatalogHeader } from "./mcp-catalog-header";
import { McpCatalogToolbar } from "./mcp-catalog-toolbar";
import { McpCardSkeleton } from "./mcp-card-skeleton";
import { McpEmptyState } from "./mcp-empty-state";
import { McpGrid } from "./mcp-grid";
import type { McpAvailabilityFilter } from "./mcp-search";
import { McpDetailsDialog } from "./mcp-details-dialog";
import type { McpViewContext } from "./mcp-view-context";

interface McpCatalogProps {
  viewContext?: McpViewContext;
}

export function McpCatalog({ viewContext = { type: "platform" } }: McpCatalogProps) {
  const query = useMcpRegistryQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<McpAvailabilityFilter>("all");
  const [selectedMcpId, setSelectedMcpId] = useState<string | null>(null);

  const filteredMcps = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return (query.data ?? []).filter((mcp) => {
      const matchesAvailability =
        availability === "all" || (availability === "available" ? mcp.available : !mcp.available);
      const searchableText = [mcp.name, mcp.displayName, mcp.description, mcp.serviceProvider]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesAvailability && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [availability, query.data, searchQuery]);

  if (query.isPending) {
    return (
      <div className="space-y-5" aria-busy="true">
        <McpCatalogHeader />
        <McpCatalogToolbar
          query={searchQuery}
          availability={availability}
          onQueryChange={setSearchQuery}
          onAvailabilityChange={setAvailability}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <McpCardSkeleton />
          <McpCardSkeleton />
          <McpCardSkeleton />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="space-y-5">
        <McpCatalogHeader />
        <div className="rounded-xl bg-zinc-900 px-6 py-12 text-center" role="alert">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
            Registry unavailable
          </p>
          <h2 className="mt-3 text-base font-medium text-white">
            We could not load the MCP catalog.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Check your connection and try again.
          </p>
          <button
            className="mt-6 font-mono text-xs text-white underline decoration-zinc-600 underline-offset-4 transition hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            type="button"
            onClick={() => void query.refetch()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <McpCatalogHeader />
      <McpCatalogToolbar
        count={filteredMcps.length}
        query={searchQuery}
        availability={availability}
        onQueryChange={setSearchQuery}
        onAvailabilityChange={setAvailability}
      />
      {filteredMcps.length > 0 ? (
        <McpGrid mcps={filteredMcps} onSelect={(mcp) => setSelectedMcpId(mcp.id)} />
      ) : (
        <McpEmptyState searching={Boolean(searchQuery.trim()) || availability !== "all"} />
      )}
      <McpDetailsDialog
        mcpId={selectedMcpId}
        context={viewContext}
        onClose={() => setSelectedMcpId(null)}
      />
    </div>
  );
}
