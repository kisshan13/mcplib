import { type FormEvent, useState } from "react";
import type { Organization } from "@/core-api/types/organization";
import { useCreateOrganizationMutation } from "@/hooks/query/organization.query";

interface OrganizationCreateFormProps {
  onCreated: (organization: Organization) => void;
}

export function OrganizationCreateForm({ onCreated }: OrganizationCreateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutation = useCreateOrganizationMutation();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setValidationError("Organization name is required.");
      return;
    }
    if (trimmedName.length > 120) {
      setValidationError("Organization names must be 120 characters or fewer.");
      return;
    }
    if (trimmedDescription.length > 1000) {
      setValidationError("Descriptions must be 1000 characters or fewer.");
      return;
    }

    setValidationError(null);
    mutation.mutate(
      { name: trimmedName, description: trimmedDescription || null },
      {
        onSuccess: (result) => {
          onCreated(result as Organization);
          setName("");
          setDescription("");
        }
      }
    );
  }

  return (
    <form className="w-72 space-y-3" aria-label="Create organization" onSubmit={submit}>
      <div>
        <h2 className="text-sm font-medium text-white">New organization</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Create a shared workspace for organization-scoped MCP configuration.
        </p>
      </div>
      <label className="block text-xs text-zinc-400">
        Name
        <input
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 block w-full bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-500"
          placeholder="Acme Inc."
        />
      </label>
      <label className="block text-xs text-zinc-400">
        Description <span className="text-zinc-600">(optional)</span>
        <textarea
          maxLength={1000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 block min-h-16 w-full resize-y bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-500"
          placeholder="What this workspace is for"
        />
      </label>
      {(validationError || mutation.isError) && (
        <p className="text-xs text-red-300" role="alert">
          {validationError ?? "We could not create this organization. Please try again."}
        </p>
      )}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-white px-3 py-2 font-mono text-xs font-medium text-zinc-950 transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "Creating..." : "Create organization"}
      </button>
    </form>
  );
}
