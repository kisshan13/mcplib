import { Link, Outlet, useLocation } from "@tanstack/react-router";

const navigation = [
  { label: "Account", to: "/app/settings" as const, exact: true },
  { label: "MCP connections", to: "/app/settings/mcps" as const },
  { label: "API keys", to: "/app/settings/api-keys" as const }
];

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-800 pb-7">
        <div className="space-y-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
            Workspace / Settings
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Manage your identity, MCP connections, and the keys that agents use to connect.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-emerald-300">
          Workspace active
        </span>
      </header>

      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-6" aria-label="Settings navigation">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1">
            {navigation.map((item) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block whitespace-nowrap rounded-md px-3 py-2 text-xs no-underline transition-colors ${active ? "bg-zinc-900 font-medium text-white ring-1 ring-zinc-800" : "text-zinc-500 hover:bg-zinc-900 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-5 hidden px-3 text-xs leading-5 text-zinc-600 lg:block">
            Changes are applied to your workspace immediately.
          </p>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
