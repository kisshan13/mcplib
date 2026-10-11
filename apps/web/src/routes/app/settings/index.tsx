import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/settings/settings-page";

export const Route = createFileRoute("/app/settings/")({
  head: () => ({
    meta: [{ title: "Settings | MCPLib" }]
  }),
  component: SettingsRoute
});

function SettingsRoute() {
  return <SettingsPage />;
}
