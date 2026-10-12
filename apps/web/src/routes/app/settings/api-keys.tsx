import { createFileRoute } from "@tanstack/react-router";
import { ApiKeysPage } from "@/components/settings/api-keys-page";

export const Route = createFileRoute("/app/settings/api-keys")({
  head: () => ({ meta: [{ title: "API Keys | MCPLib" }] }),
  component: ApiKeysRoute
});

function ApiKeysRoute() {
  return <ApiKeysPage />;
}
