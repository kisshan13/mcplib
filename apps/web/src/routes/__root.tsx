import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Scripts, Outlet } from "@tanstack/react-router";
import { QueryProvider } from "@/query-provider";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Web workspace" }
    ]
  }),
  component: RootComponent
});

function RootComponent() {
  return (
    <RootDocument>
      <QueryProvider>
        <Outlet />
      </QueryProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
