import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { Organization } from "@/core-api/types/organization";
import { useOrganizationsQuery } from "@/hooks/query/organization.query";
import { OrganizationCreateForm } from "./organization-create-form";

const personalWorkspaceValue = "__personal__";

function getOrganizationId(pathname: string) {
  const match = pathname.match(/^\/app\/organizations\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function OrganizationSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const organizations = useOrganizationsQuery();
  const [createOpen, setCreateOpen] = useState(false);
  const activeOrganizationId = getOrganizationId(location.pathname);
  const activeValue = activeOrganizationId ?? personalWorkspaceValue;

  function switchWorkspace(value: string) {
    if (value === personalWorkspaceValue) {
      void navigate({ to: "/app" });
      return;
    }

    void navigate({
      to: "/app/organizations/$organizationId",
      params: { organizationId: value }
    });
  }

  function handleCreated(organization: Organization) {
    setCreateOpen(false);
    void navigate({
      to: "/app/organizations/$organizationId",
      params: { organizationId: organization.id }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="workspace-switcher">
        Active workspace
      </label>
      <select
        id="workspace-switcher"
        aria-label="Active workspace"
        value={activeValue}
        disabled={organizations.isPending}
        onChange={(event) => switchWorkspace(event.target.value)}
        className="max-w-40 bg-zinc-900 px-2 py-2 font-mono text-[0.65rem] text-zinc-300 outline-none ring-1 ring-zinc-800 focus:ring-zinc-500 sm:max-w-52"
      >
        <option value={personalWorkspaceValue}>Personal workspace</option>
        {organizations.data?.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCreateOpen((open) => !open)}
        aria-expanded={createOpen}
        className="whitespace-nowrap px-2 py-2 font-mono text-[0.65rem] text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        + New
      </button>
      {createOpen && (
        <div className="absolute right-6 top-14 z-20 rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-2xl lg:right-8">
          <OrganizationCreateForm onCreated={handleCreated} />
        </div>
      )}
      {organizations.isSuccess && organizations.data.length === 0 && (
        <span className="hidden text-[0.65rem] text-zinc-600 sm:inline">No organizations yet</span>
      )}
      {organizations.isError && (
        <span className="text-[0.65rem] text-red-300" role="alert">
          Organizations are unavailable.
        </span>
      )}
    </div>
  );
}
