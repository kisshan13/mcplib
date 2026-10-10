export type McpAvailabilityFilter = "all" | "available" | "unavailable";

interface McpSearchProps {
  query: string;
  availability: McpAvailabilityFilter;
  onQueryChange: (query: string) => void;
  onAvailabilityChange: (availability: McpAvailabilityFilter) => void;
}

export function McpSearch({
  query,
  availability,
  onQueryChange,
  onAvailabilityChange
}: McpSearchProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
      <div className="min-w-0 sm:w-72">
        <label
          className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500"
          htmlFor="mcp-search"
        >
          Search MCPs
        </label>
        <input
          id="mcp-search"
          className="mt-1.5 block w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-1 ring-inset ring-zinc-800 transition placeholder:text-zinc-600 focus:ring-2 focus:ring-white"
          placeholder="Search by name, provider, or description"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="sm:w-36">
        <label
          className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500"
          htmlFor="mcp-availability"
        >
          Availability
        </label>
        <select
          id="mcp-availability"
          className="mt-1.5 block w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none ring-1 ring-inset ring-zinc-800 transition focus:ring-2 focus:ring-white"
          value={availability}
          onChange={(event) => onAvailabilityChange(event.target.value as McpAvailabilityFilter)}
        >
          <option value="all">All MCPs</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>
    </div>
  );
}
