import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <strong>Web workspace</strong>
      </header>
      <section>{children}</section>
    </main>
  );
}
