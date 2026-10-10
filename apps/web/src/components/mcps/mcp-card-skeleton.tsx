export function McpCardSkeleton() {
  return (
    <div className="min-h-48 animate-pulse rounded-xl bg-zinc-900 p-4" aria-hidden="true">
      <div className="h-3 w-24 rounded bg-zinc-800" />
      <div className="mt-4 h-5 w-2/3 rounded bg-zinc-800" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-5/6 rounded bg-zinc-800" />
      </div>
    </div>
  );
}
