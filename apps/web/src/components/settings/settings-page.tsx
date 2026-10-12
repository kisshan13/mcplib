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
    <section
      id="account"
      aria-labelledby="account-information-title"
      className="scroll-mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="account-information-title" className="text-sm font-medium text-white">
            Account
          </h2>
          <p className="mt-1 text-sm text-zinc-500">The account currently signed in to MCPLib.</p>
        </div>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-600">
          Personal profile
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-lg bg-zinc-950 p-5">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-full bg-zinc-700 font-mono text-sm font-medium text-white"
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
            <dd className="truncate text-sm text-zinc-400">{user?.email ?? "Email unavailable"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
