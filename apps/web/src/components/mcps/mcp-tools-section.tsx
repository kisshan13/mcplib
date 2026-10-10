import { useMcpToolsQuery } from "@/hooks/query/use-mcp-tools-query";

export function McpToolsSection({ mcpId }: { mcpId: string }) {
  const query = useMcpToolsQuery(mcpId);

  return (
    <section className="space-y-3" aria-labelledby="mcp-tools-title">
      <div className="flex items-baseline justify-between gap-4">
        <h3 id="mcp-tools-title" className="text-sm font-medium text-white">
          Tools
        </h3>
        {query.isSuccess && (
          <span className="font-mono text-[0.65rem] text-zinc-500">
            {query.data.length} {query.data.length === 1 ? "tool" : "tools"}
          </span>
        )}
      </div>

      {query.isPending && (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="h-12 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-12 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      )}

      {query.isError && (
        <div className="space-y-2 rounded-lg bg-zinc-950/70 p-3" role="alert">
          <p className="text-sm text-zinc-400">The tools for this MCP could not be loaded.</p>
          <button
            type="button"
            className="font-mono text-xs text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            onClick={() => void query.refetch()}
          >
            Try again
          </button>
        </div>
      )}

      {query.isSuccess && query.data.length === 0 && (
        <p className="rounded-lg bg-zinc-950/70 p-3 text-sm text-zinc-400">
          This MCP does not currently expose any tools.
        </p>
      )}

      {query.isSuccess && query.data.length > 0 && (
        <ul className="space-y-2">
          {query.data.map((tool) => (
            <li key={tool.name} className="rounded-lg bg-zinc-950/70 p-3">
              <h4 className="font-mono text-xs font-medium text-zinc-200">{tool.name}</h4>
              <p className="mt-1 text-sm leading-5 text-zinc-400">
                {tool.description || "No description is available for this tool."}
              </p>
              <details className="mt-3 text-xs text-zinc-500">
                <summary className="cursor-pointer font-mono transition-colors hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  View schemas
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-600">
                      Input
                    </p>
                    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-900 p-2 font-mono text-[0.65rem] leading-5 text-zinc-500">
                      {JSON.stringify(tool.inputSchema, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-600">
                      Output
                    </p>
                    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-900 p-2 font-mono text-[0.65rem] leading-5 text-zinc-500">
                      {JSON.stringify(tool.outputSchema, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
