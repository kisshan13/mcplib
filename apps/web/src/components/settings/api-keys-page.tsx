import { ApiKeysSection } from "./api-keys-section";

export function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
          Access management
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-white">API keys</h2>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          Create scoped credentials and decide which MCP servers each one can access.
        </p>
      </header>

      <ApiKeysSection />
    </div>
  );
}
