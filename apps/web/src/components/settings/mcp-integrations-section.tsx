import { Surface } from "@/components/ui";

const placeholderConnections = [
  {
    id: "github-mcp",
    name: "GitHub",
    description: "Access GitHub tools through an authorized MCP connection.",
    status: "Authorized"
  }
];

export function McpIntegrationsSection() {
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
        {placeholderConnections.map((connection) => (
          <Surface
            as="article"
            padding="compact"
            tone="muted"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            key={connection.id}
          >
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white">{connection.name}</h3>
              <p className="mt-1 text-sm leading-5 text-zinc-400">{connection.description}</p>
            </div>
            <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-400">
              {connection.status}
            </span>
          </Surface>
        ))}
        <p className="font-mono text-[0.65rem] leading-5 text-zinc-600">
          Placeholder connections are shown until connection management endpoints are available.
        </p>
      </div>
    </details>
  );
}
