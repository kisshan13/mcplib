import { useEffect, useMemo, useRef } from "react";
import { useMcpQuery } from "@/hooks/query/use-mcp-query";
import { McpConfigurationForm } from "./mcp-configuration-form";
import { McpImage } from "./mcp-image";
import { McpToolsSection } from "./mcp-tools-section";
import type { McpViewContext } from "./mcp-view-context";

interface McpDetailsDialogProps {
  mcpId: string | null;
  context: McpViewContext;
  onClose: () => void;
}

export function McpDetailsDialog({ mcpId, context, onClose }: McpDetailsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const query = useMcpQuery(mcpId ?? "");
  const isOpen = Boolean(mcpId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const title = useMemo(() => {
    const mcp = query.data;
    return mcp ? mcp.displayName || mcp.name : "MCP details";
  }, [query.data]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="MCP details"
      className="fixed left-1/2 top-1/2 m-0 max-h-[70vh] w-[calc(100vw-2rem)] max-w-[70vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-zinc-900 p-0 text-zinc-100 shadow-2xl backdrop:bg-black/70 sm:w-auto"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="flex max-h-[70vh] flex-col">
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {query.isPending && (
            <div className="space-y-3 py-5" role="status" aria-live="polite">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
                Loading MCP
              </p>
              <div className="h-5 w-48 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-zinc-800" />
            </div>
          )}

          {query.isError && (
            <div className="space-y-3 py-5" role="alert">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
                MCP unavailable
              </p>
              <h2 className="text-base font-medium text-white">We could not load this MCP.</h2>
              <p className="text-sm leading-6 text-zinc-400">
                The details could not be retrieved. Close this window and try again.
              </p>
            </div>
          )}

          {query.isSuccess && (
            <div className="space-y-6">
              <header className="flex items-start gap-3">
                <McpImage mcpId={query.data.id} />
                <div className="min-w-0 space-y-2">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
                    {query.data.serviceProvider || "MCP implementation"}
                  </p>
                  <h2 className="text-lg font-medium tracking-tight text-white">{title}</h2>
                  <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                    {query.data.description || "No description is available for this MCP."}
                  </p>
                </div>
              </header>

              <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[0.65rem] text-zinc-500">
                <span>
                  {context.type === "platform"
                    ? "Platform configuration"
                    : "Organization configuration"}
                </span>
                {query.data.version && <span>v{query.data.version}</span>}
                <span>{query.data.available ? "Available" : "Unavailable"}</span>
              </div>

              <McpConfigurationForm configuration={query.data.secretProviderConfiguration} />
              <McpToolsSection mcpId={query.data.id} />
            </div>
          )}
        </div>

        <div className="flex justify-end bg-zinc-950/60 px-5 py-4 sm:px-6">
          <button
            type="button"
            className="inline-flex items-center justify-center px-3 py-2 font-mono text-xs text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
