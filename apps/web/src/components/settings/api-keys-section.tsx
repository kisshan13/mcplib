import { useMemo, useState } from "react";
import { useMcpRegistryQuery } from "@/hooks/query/use-mcp-registry-query";
import { useOrganizationsQuery } from "@/hooks/query/use-organizations-query";
import { useApiKeyMcpAccessQuery, useApiKeysQuery } from "@/hooks/query/use-api-keys-query";
import {
  useCreateApiKeyMutation,
  useGrantApiKeyMcpAccessMutation,
  useRevokeApiKeyMcpAccessMutation,
  useRevokeApiKeyMutation
} from "@/hooks/query/use-api-key-mutations";
import type { ApiKeyType } from "@/core-api/types/api-key";

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
    : "Never";
}

function keyStatus(key: { revokedAt: string | null; expiresAt: string | null }) {
  if (key.revokedAt) return "Revoked";
  if (key.expiresAt && new Date(key.expiresAt) <= new Date()) return "Expired";
  return "Active";
}

export function ApiKeysSection() {
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useApiKeysQuery({
    type: type || undefined,
    status: status || undefined,
    search: search || undefined
  });
  const selected = query.data?.items.find((item) => item.id === selectedId) ?? null;

  return (
    <section
      id="api-keys"
      aria-labelledby="api-keys-title"
      className="scroll-mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="api-keys-title" className="text-sm font-medium text-white">
            API keys
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Create scoped keys for MCP clients. Each key can access only the MCPs you authorize.
          </p>
        </div>
        <CreateApiKeyForm />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Search API keys"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search keys"
          className="min-w-48 flex-1 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-500"
        />
        <select
          aria-label="Filter by key type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="bg-zinc-950 px-3 py-2 text-sm text-zinc-300 ring-1 ring-zinc-800"
        >
          <option value="">All scopes</option>
          <option value="platform">Platform</option>
          <option value="organization">Organization</option>
        </select>
        <select
          aria-label="Filter by key status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="bg-zinc-950 px-3 py-2 text-sm text-zinc-300 ring-1 ring-zinc-800"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {query.isPending && (
        <p className="text-sm text-zinc-500" role="status">
          Loading API keys...
        </p>
      )}
      {query.isError && (
        <p className="text-sm text-zinc-500" role="alert">
          API keys are unavailable right now.
        </p>
      )}
      {query.isSuccess && query.data.items.length === 0 && (
        <p className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-500">
          No API keys match these filters.
        </p>
      )}
      {query.isSuccess && query.data.items.length > 0 && (
        <div className="divide-y divide-zinc-800 rounded-lg bg-zinc-950">
          {query.data.items.map((key) => (
            <button
              key={key.id}
              type="button"
              onClick={() => setSelectedId(key.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left hover:bg-zinc-900"
            >
              <span className="min-w-40">
                <span className="block text-sm font-medium text-white">{key.name}</span>
                <span className="mt-1 block font-mono text-xs text-zinc-500">
                  {key.prefix}... - {key.type}
                </span>
              </span>
              <span className="text-xs text-zinc-500">{key.organization?.name ?? "Platform"}</span>
              <span className="text-xs text-zinc-500">
                {key.mcpAccessCount} MCP{key.mcpAccessCount === 1 ? "" : "s"}
              </span>
              <span
                className={
                  keyStatus(key) === "Active" ? "text-xs text-zinc-200" : "text-xs text-zinc-600"
                }
              >
                {keyStatus(key)}
              </span>
              <span className="text-xs text-zinc-500">Expires {formatDate(key.expiresAt)}</span>
            </button>
          ))}
        </div>
      )}
      {selected && <ApiKeyDetails keyData={selected} onClose={() => setSelectedId(null)} />}
    </section>
  );
}

function CreateApiKeyForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ApiKeyType>("platform");
  const [organizationId, setOrganizationId] = useState("");
  const [expirationDays, setExpirationDays] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const mutation = useCreateApiKeyMutation();
  const organizations = useOrganizationsQuery();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(
      {
        name,
        description: description || null,
        type,
        ...(type === "organization" ? { organizationId } : {}),
        ...(expirationDays ? { expirationDays: Number(expirationDays) } : {})
      },
      {
        onSuccess: (result) => {
          setSecret(result.secret);
          setName("");
          setDescription("");
        }
      }
    );
  }

  if (!open && !secret)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-white px-3 py-2 font-mono text-xs font-medium text-zinc-950 hover:bg-zinc-300"
      >
        Create API key
      </button>
    );
  if (secret)
    return (
      <div
        className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
        role="status"
      >
        <p className="text-sm font-medium text-amber-100">Save this secret now</p>
        <p className="mt-1 text-xs text-amber-200/70">It will not be shown again.</p>
        <div className="mt-3 flex gap-2">
          <code className="min-w-0 flex-1 break-all bg-zinc-950 p-2 text-xs text-zinc-200">
            {secret}
          </code>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(secret)}
            className="shrink-0 bg-white px-3 text-xs font-medium text-zinc-950"
          >
            Copy
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setSecret(null);
            setOpen(false);
          }}
          className="mt-3 text-xs text-amber-100 underline"
        >
          Done
        </button>
      </div>
    );

  return (
    <form
      onSubmit={submit}
      className="w-full space-y-3 rounded-lg bg-zinc-950 p-4"
      aria-label="Create API key"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">New API key</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500">
          Close
        </button>
      </div>
      <input
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Key name"
        className="w-full bg-zinc-900 px-3 py-2 text-sm text-white ring-1 ring-zinc-800 outline-none"
      />
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        className="w-full bg-zinc-900 px-3 py-2 text-sm text-white ring-1 ring-zinc-800 outline-none"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-500">
          Scope
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ApiKeyType)}
            className="mt-1 block w-full bg-zinc-900 px-3 py-2 text-sm text-white ring-1 ring-zinc-800"
          >
            <option value="platform">Platform</option>
            <option value="organization">Organization</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          Expires
          <select
            value={expirationDays}
            onChange={(event) => setExpirationDays(event.target.value)}
            className="mt-1 block w-full bg-zinc-900 px-3 py-2 text-sm text-white ring-1 ring-zinc-800"
          >
            <option value="">Never</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
        </label>
      </div>
      {type === "organization" && (
        <label className="block text-xs text-zinc-500">
          Organization
          <select
            required
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="mt-1 block w-full bg-zinc-900 px-3 py-2 text-sm text-white ring-1 ring-zinc-800"
          >
            <option value="">Choose an organization</option>
            {organizations.data?.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {mutation.isError && (
        <p className="text-xs text-red-300" role="alert">
          Unable to create this key. Check the scope and try again.
        </p>
      )}
      <button
        disabled={mutation.isPending}
        type="submit"
        className="bg-white px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-50"
      >
        {mutation.isPending ? "Creating..." : "Generate secret"}
      </button>
    </form>
  );
}

function ApiKeyDetails({
  keyData,
  onClose
}: {
  keyData: NonNullable<ReturnType<typeof useApiKeysQuery>["data"]>["items"][number];
  onClose: () => void;
}) {
  const accessQuery = useApiKeyMcpAccessQuery(keyData.id);
  const mcps = useMcpRegistryQuery();
  const [mcpId, setMcpId] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const revoke = useRevokeApiKeyMutation();
  const grant = useGrantApiKeyMcpAccessMutation();
  const revokeAccess = useRevokeApiKeyMcpAccessMutation();
  const available = useMemo(
    () =>
      (mcps.data ?? []).filter(
        (mcp) => !(accessQuery.data ?? []).some((access) => access.mcpId === mcp.id)
      ),
    [mcps.data, accessQuery.data]
  );
  const inactive = Boolean(
    keyData.revokedAt || (keyData.expiresAt && new Date(keyData.expiresAt) <= new Date())
  );

  return (
    <article
      className="space-y-5 rounded-lg border border-zinc-800 bg-zinc-900 p-5"
      aria-label="API key details"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-white">{keyData.name}</h3>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            {keyData.prefix}... - {keyData.type}
            {keyData.organization ? ` - ${keyData.organization.name}` : ""}
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-zinc-500">
          Close
        </button>
      </div>
      <dl className="grid gap-3 text-xs text-zinc-500 sm:grid-cols-3">
        <div>
          <dt>Created</dt>
          <dd className="mt-1 text-zinc-300">{formatDate(keyData.createdAt)}</dd>
        </div>
        <div>
          <dt>Expires</dt>
          <dd className="mt-1 text-zinc-300">{formatDate(keyData.expiresAt)}</dd>
        </div>
        <div>
          <dt>Last used</dt>
          <dd className="mt-1 text-zinc-300">{formatDate(keyData.lastUsedAt)}</dd>
        </div>
      </dl>
      <section className="space-y-3" aria-labelledby="mcp-access-title">
        <div>
          <h4 id="mcp-access-title" className="text-sm font-medium text-white">
            Authorized MCP servers
          </h4>
          <p className="mt-1 text-xs text-zinc-500">Removing one server does not revoke the key.</p>
        </div>
        {accessQuery.isError && (
          <p className="text-xs text-red-300" role="alert">
            Access assignments are unavailable.
          </p>
        )}
        {accessQuery.data?.map((access) => (
          <div
            key={access.mcpId}
            className="flex items-center justify-between gap-3 bg-zinc-950 px-3 py-2"
          >
            <span className="text-sm text-zinc-300">{access.displayName}</span>
            <button
              disabled={revokeAccess.isPending || inactive}
              type="button"
              onClick={() => revokeAccess.mutate({ id: keyData.id, mcpId: access.mcpId })}
              className="text-xs text-zinc-500 underline disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
        {!accessQuery.isPending && !accessQuery.data?.length && (
          <p className="text-xs text-zinc-500">No MCP servers authorized yet.</p>
        )}
        <div className="flex gap-2">
          <select
            disabled={inactive || !available.length}
            value={mcpId}
            onChange={(event) => setMcpId(event.target.value)}
            className="min-w-0 flex-1 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 ring-1 ring-zinc-800"
          >
            <option value="">Choose an MCP server</option>
            {available.map((mcp) => (
              <option key={mcp.id} value={mcp.id}>
                {mcp.displayName}
              </option>
            ))}
          </select>
          <button
            disabled={!mcpId || grant.isPending || inactive}
            type="button"
            onClick={() =>
              grant.mutate({ id: keyData.id, mcpId }, { onSuccess: () => setMcpId("") })
            }
            className="bg-white px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </section>
      {!inactive && !confirmRevoke && (
        <button
          type="button"
          onClick={() => setConfirmRevoke(true)}
          className="text-xs text-red-300 underline"
        >
          Revoke this API key
        </button>
      )}
      {confirmRevoke && (
        <div
          role="dialog"
          aria-label="Confirm API key revocation"
          className="border border-red-500/30 bg-red-500/10 p-3"
        >
          <p className="text-sm text-red-100">
            Revoke "{keyData.name}"? Future authentication attempts will fail.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              disabled={revoke.isPending}
              type="button"
              onClick={() => revoke.mutate(keyData.id, { onSuccess: onClose })}
              className="bg-red-200 px-3 py-2 text-xs font-medium text-red-950"
            >
              {revoke.isPending ? "Revoking..." : "Confirm revoke"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmRevoke(false)}
              className="px-3 py-2 text-xs text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
