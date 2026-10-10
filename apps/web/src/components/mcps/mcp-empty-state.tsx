export function McpEmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="rounded-xl bg-zinc-900 px-6 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
        {searching ? "No matches" : "Catalog is empty"}
      </p>
      <h2 className="mt-3 text-base font-medium text-white">
        {searching ? "No MCPs match your search." : "No MCPs are available yet."}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
        {searching
          ? "Try a different name, provider, or description."
          : "Registered implementations will appear here when they become available."}
      </p>
    </div>
  );
}
