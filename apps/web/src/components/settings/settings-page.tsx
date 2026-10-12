import { McpIntegrationsSection } from "./mcp-integrations-section";
import { ApiKeysSection } from "./api-keys-section";
import { authClient } from "@/lib/auth";

function getInitials(name: string | undefined, email: string | undefined) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return email?.[0]?.toUpperCase() ?? "U";
}

export function SettingsPage() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const displayName = user?.name?.trim() || "Your account";
  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
          Settings
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-white">Account settings</h1>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          Manage your account details and the connections used by your MCPs.
        </p>
      </header>

      <section aria-labelledby="account-information-title" className="space-y-4">
        <div>
          <h2 id="account-information-title" className="text-sm font-medium text-white">
            User information
          </h2>
          <p className="mt-1 text-sm text-zinc-500">The account currently signed in to MCPLib.</p>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-zinc-900 p-5">
          <div
            className="grid size-11 shrink-0 place-items-center rounded-full bg-zinc-700 font-mono text-sm font-medium text-white"
            aria-hidden="true"
          >
            {initials}
          </div>
          <dl className="min-w-0 space-y-1">
            <div>
              <dt className="sr-only">Name</dt>
              <dd className="truncate text-sm font-medium text-white">{displayName}</dd>
            </div>
            <div>
              <dt className="sr-only">Email</dt>
              <dd className="truncate text-sm text-zinc-400">
                {user?.email ?? "Email unavailable"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="connections-title" className="rounded-xl bg-zinc-900 px-5">
        <h2 id="connections-title" className="sr-only">
          MCP and integrations
        </h2>
        <McpIntegrationsSection />
      </section>

      <ApiKeysSection />
    </div>
  );
}
