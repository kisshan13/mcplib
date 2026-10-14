import { Link } from "@tanstack/react-router";
import { McpCatalog } from "@/components/mcps/mcp-catalog";
import { useOrganizationQuery } from "@/hooks/query/organization.query";

export function OrganizationWorkspace({ organizationId }: { organizationId: string }) {
  const organization = useOrganizationQuery(organizationId);

  if (organization.isPending) {
    return (
      <p className="font-mono text-xs text-zinc-400" role="status">
        Loading organization...
      </p>
    );
  }

  if (organization.isError || !organization.data) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-8" role="alert">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
          Organization unavailable
        </p>
        <h1 className="mt-3 text-lg font-medium text-white">
          This organization could not be loaded.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          You may no longer have access to it, or the request failed. Choose another workspace to
          continue.
        </p>
        <Link
          to="/app"
          className="mt-5 inline-flex font-mono text-xs text-white underline decoration-zinc-600 underline-offset-4"
        >
          Return to personal workspace
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
          Organization workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {organization.data.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          {organization.data.description || "Manage MCP configuration shared by this organization."}
        </p>
      </header>

      <McpCatalog viewContext={{ type: "organization", id: organizationId }} />
    </div>
  );
}
