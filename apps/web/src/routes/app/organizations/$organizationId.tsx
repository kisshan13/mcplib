import { createFileRoute } from "@tanstack/react-router";
import { OrganizationWorkspace } from "@/components/organizations/organization-workspace";

export const Route = createFileRoute("/app/organizations/$organizationId")({
  head: () => ({ meta: [{ title: "Organization Workspace | MCPLib" }] }),
  component: OrganizationRoute
});

function OrganizationRoute() {
  const { organizationId } = Route.useParams();
  return <OrganizationWorkspace organizationId={organizationId} />;
}
