import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell mx-auto max-w-4xl p-8">
      <header className="app-header mb-6">
        <strong>Web workspace</strong>
      </header>
      <section>{children}</section>
    </main>
  );
}
