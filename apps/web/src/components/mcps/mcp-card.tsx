import type { McpMetadata } from "@/core-api/types/mcp-registry";
import { Surface } from "@/components/ui";
import { McpImage } from "./mcp-image";

export function McpCard({ mcp }: { mcp: McpMetadata }) {
  const title = mcp.displayName || mcp.name;
  const description = mcp.description?.trim() || "No description is available for this MCP.";
  const authMethods = mcp.supportedAuthMethods.slice(0, 2).join(" / ");

  return (
    <Surface as="article" padding="compact" tone="muted" className="flex flex-col gap-3">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <McpImage mcpId={mcp.id} />
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
              {mcp.serviceProvider || "MCP implementation"}
            </p>
            <h2 className="mt-1 break-words text-base font-medium tracking-tight text-white">
              {title}
            </h2>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] ${
            mcp.available ? "bg-zinc-700 text-zinc-200" : "bg-zinc-900 text-zinc-500"
          }`}
        >
          {mcp.available ? "Available" : "Unavailable"}
        </span>
      </header>

      <p className="line-clamp-2 text-sm leading-5 text-zinc-400">{description}</p>

      <footer className="mt-auto flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.6rem] text-zinc-500">
        {mcp.version && <span>v{mcp.version}</span>}
        {authMethods && <span>{authMethods}</span>}
        {mcp.capabilities.length > 0 && (
          <span>
            {mcp.capabilities.length}{" "}
            {mcp.capabilities.length === 1 ? "capability" : "capabilities"}
          </span>
        )}
      </footer>
    </Surface>
  );
}
