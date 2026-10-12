import { Link } from "@tanstack/react-router";
import { McpImage } from "@/components/mcps/mcp-image";
import { useApiKeysQuery } from "@/hooks/query/use-api-keys-query";
import { useMcpConfigurationStatusesQuery } from "@/hooks/query/use-mcp-configuration-status-query";
import { useMcpRegistryQuery } from "@/hooks/query/use-mcp-registry-query";

function isActiveKey(key: { revokedAt: string | null; expiresAt: string | null }) {
  return !key.revokedAt && (!key.expiresAt || new Date(key.expiresAt) > new Date());
}

export function WorkspaceDashboard() {
  const registry = useMcpRegistryQuery();
  const configurations = useMcpConfigurationStatusesQuery();
  const apiKeys = useApiKeysQuery({ page: 1 });

  const mcps = registry.data ?? [];
  const connections = configurations.data ?? [];
  const keys = apiKeys.data?.items ?? [];
  const configuredConnections = connections.filter((connection) => connection.configured).length;
  const activeKeys = keys.filter(isActiveKey).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
          Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">MCP workspace</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Workspace statistics">
        <SummaryCard
          label="MCPs"
          value={registry.isSuccess ? String(mcps.length) : "—"}
          detail={
            registry.isSuccess
              ? `${mcps.filter((mcp) => mcp.available).length} available`
              : "Loading"
          }
          accent="sky"
        />
        <SummaryCard
          label="Connections"
          value={configurations.isSuccess ? `${configuredConnections}/${connections.length}` : "—"}
          detail={configurations.isSuccess ? "Ready" : "Loading"}
          accent="emerald"
        />
        <SummaryCard
          label="Active keys"
          value={apiKeys.isSuccess ? String(activeKeys) : "—"}
          detail={apiKeys.isSuccess ? `${apiKeys.data.total} total` : "Loading"}
          accent="amber"
        />
      </section>

      <section className="space-y-4" aria-labelledby="mcp-grid-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-zinc-500">
              Catalog
            </p>
            <h2 id="mcp-grid-title" className="mt-2 text-lg font-medium text-white">
              MCPs
            </h2>
          </div>
          <Link
            to="/app/mcps"
            className="font-mono text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-4 transition hover:text-white hover:decoration-zinc-400"
          >
            View all -&gt;
          </Link>
        </div>

        {registry.isPending && <McpGridSkeleton />}
        {registry.isError && (
          <p
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-500"
            role="alert"
          >
            MCPs are unavailable right now.
          </p>
        )}
        {registry.isSuccess && mcps.length === 0 && (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-500">
            No MCPs have been registered yet.
          </p>
        )}
        {registry.isSuccess && mcps.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {mcps.map((mcp) => (
              <Link
                key={mcp.id}
                to="/app/mcps"
                className="group flex min-h-20 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 no-underline transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <McpImage mcpId={mcp.id} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {mcp.displayName}
                  </span>
                </span>
                <span
                  className="text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300"
                  aria-hidden="true"
                >
                  -&gt;
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  accent
}: {
  label: string;
  value: string;
  detail: string;
  accent: "sky" | "emerald" | "amber";
}) {
  const accents = { sky: "bg-sky-400", emerald: "bg-emerald-400", amber: "bg-amber-400" };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-zinc-500">{label}</p>
        <span className={`size-1.5 rounded-full ${accents[accent]}`} aria-hidden="true" />
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function McpGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
        />
      ))}
    </div>
  );
}
