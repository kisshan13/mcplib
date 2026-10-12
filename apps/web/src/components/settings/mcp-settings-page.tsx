import { McpIntegrationsSection } from "./mcp-integrations-section";

export function McpSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
          Connections
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-white">MCP connections</h2>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          Manage the services authorized for your MCP connections.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6">
        <McpIntegrationsSection />
      </section>
    </div>
  );
}
