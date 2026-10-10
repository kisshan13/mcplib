import { createFileRoute, Link } from "@tanstack/react-router";
import { Surface } from "@/components/ui";
import { useMcpRegistryQuery } from "@/hooks/query/use-mcp-registry-query";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "App | MCPLib" }]
  }),
  component: WorkspaceRoute
});

function WorkspaceRoute() {
  const mcpRegistry = useMcpRegistryQuery();

  return (
    <div className="space-y-6">
      <section className="max-w-xl space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">Workspace</p>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Workspace</h1>
        <p className="text-sm leading-6 text-zinc-400">
          Discover MCP servers and keep the infrastructure around your agent connections in one
          place.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2" aria-label="Workspace areas">
        <Surface as="article" padding="compact" tone="muted">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">Registry</p>
          <h2 className="mt-3 text-sm font-medium text-white">Explore MCP tools</h2>
          <p className="mt-2 max-w-sm text-sm leading-5 text-zinc-400">
            Browse the implementations available through the platform and inspect their public
            metadata.
          </p>
          {mcpRegistry.isSuccess && (
            <p className="mt-3 font-mono text-xs text-zinc-500">
              {mcpRegistry.data.length} {mcpRegistry.data.length === 1 ? "MCP" : "MCPs"} registered
            </p>
          )}
          <Link
            to="/app/mcps"
            className="mt-6 inline-flex items-center justify-center gap-2 bg-white px-3 py-2 font-mono text-xs font-medium text-zinc-950 no-underline transition-colors hover:bg-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Open catalog <span aria-hidden="true">-&gt;</span>
          </Link>
        </Surface>

        <Surface as="article" padding="compact" tone="dark">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">Connections</p>
          <h2 className="mt-3 text-sm font-medium text-white">Access with control</h2>
          <p className="mt-2 max-w-sm text-sm leading-5 text-zinc-400">
            Authentication and credential access stay separate from the MCP implementations that use
            them.
          </p>
        </Surface>
      </section>
    </div>
  );
}
