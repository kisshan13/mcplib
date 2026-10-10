import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppLayout
});

function AppLayout() {
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
      <Outlet />
    </AppShell>
  );
}
