import type { ReactNode } from "react";
import { BrandMark, TextLink } from "@/components/ui";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="bg-zinc-950/95">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-6 px-6 lg:px-8">
          <a
            className="inline-flex items-center gap-3 font-mono text-sm font-semibold tracking-tight text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            href="/"
          >
            <BrandMark size={32} className="size-10 shrink-0" />
            <span>
              mcplib<span className="text-zinc-500">/</span>
            </span>
          </a>

          <nav className="flex items-center gap-5" aria-label="Workspace navigation">
            <TextLink href="/#discover">Discover</TextLink>
            <TextLink href="https://github.com/kisshan13/mcplib" target="_blank" rel="noreferrer">
              GitHub
            </TextLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        {children}
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 pb-8 font-mono text-[0.65rem] text-zinc-600 lg:px-8">
        <span>MCPLib workspace</span>
        <span>Open-source MCP infrastructure</span>
      </footer>
    </div>
  );
}
