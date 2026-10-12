import { Surface } from "@/components/ui";
import { useMcpConfigurationStatusesQuery } from "@/hooks/query/mcp.query";

function getStatusLabel(
  status: "connected" | "needs_authorization" | "not_configured" | "not_required"
) {
  switch (status) {
    case "connected":
      return "Configured";
    case "needs_authorization":
      return "Not configured";
    case "not_configured":
      return "Unavailable";
    case "not_required":
      return "No credentials required";
  }
}

export function McpIntegrationsSection() {
  const query = useMcpConfigurationStatusesQuery();

  return (
    <details className="group border-t border-zinc-800 py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-medium text-white">MCP &amp; Integration</span>
          <span className="mt-1 block text-sm text-zinc-500">
            Manage the services authorized for your MCP connections.
          </span>
        </span>
        <span
          className="font-mono text-sm text-zinc-500 transition-transform group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>

      <div className="mt-5 space-y-3">
        {query.isPending && (
          <p className="text-sm text-zinc-500" role="status">
            Checking MCP connections...
          </p>
        )}

        {query.isError && (
          <p className="text-sm text-zinc-500" role="alert">
            Connection status is unavailable right now.
          </p>
        )}

        {query.isSuccess && query.data.length === 0 && (
          <p className="text-sm text-zinc-500">No MCPs are registered yet.</p>
        )}

        {query.isSuccess &&
          query.data.map((connection) => (
            <Surface
              as="article"
              padding="compact"
              tone="muted"
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              key={connection.mcpId}
            >
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-white">{connection.displayName}</h3>
                <p className="mt-1 text-sm leading-5 text-zinc-400">
                  {connection.authentication === "oauth"
                    ? "Platform OAuth connection"
                    : connection.authentication === "direct"
                      ? "Direct service credential"
                      : "No additional credential required"}
                </p>
              </div>
              <span
                className={`shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.08em] ${connection.configured ? "text-zinc-200" : "text-zinc-500"}`}
              >
                {getStatusLabel(connection.status)}
              </span>
            </Surface>
          ))}
      </div>
    </details>
  );
}
