import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Surface } from "@/components/ui";
import { AppShell } from "@/components/layout/app-shell";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "App | MCPLib" }]
  }),
  component: AppRoute
});

function AppRoute() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.isPending && !session.data) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [navigate, session.data, session.isPending]);

  if (session.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 px-6 py-12 text-zinc-100">
        <p className="font-mono text-xs text-zinc-400" role="status">
          Loading your workspace...
        </p>
      </main>
    );
  }

  if (!session.data) {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-12">
        <section className="max-w-2xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">Workspace</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Welcome, {session.data.user.name}
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-400">
            Discover MCP servers and keep the infrastructure around your agent connections in one
            place.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2" aria-label="Workspace areas">
          <Surface as="article" tone="muted" className="min-h-56">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">Registry</p>
            <h2 className="mt-8 text-xl font-medium text-white">Explore MCP tools</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
              Browse the implementations available through the platform and inspect their public
              metadata.
            </p>
            <a
              className="mt-6 inline-flex font-mono text-xs text-white underline decoration-zinc-600 underline-offset-4 transition hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/#discover"
            >
              View discovery overview -&gt;
            </a>
          </Surface>

          <Surface as="article" tone="dark" className="min-h-56">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
              Connections
            </p>
            <h2 className="mt-8 text-xl font-medium text-white">Access with control</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
              Authentication and credential access stay separate from the MCP implementations that
              use them.
            </p>
          </Surface>
        </section>
      </div>
    </AppShell>
  );
}
