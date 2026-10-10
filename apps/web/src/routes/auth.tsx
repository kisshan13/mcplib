import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/auth/auth-page";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Sign in | MCPLib" }]
  }),
  component: AuthPage
});
