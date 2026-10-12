import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceDashboard } from "@/components/workspace-dashboard";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "Workspace | MCPLib" }]
  }),
  component: WorkspaceDashboard
});
