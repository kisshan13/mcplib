export type KnownMcpId = "example-mcp";

export const mcpImageMap: Readonly<Record<KnownMcpId, string>> = {
  "example-mcp": "/mcps/example-mcp.svg"
};

export function resolveMcpImage(mcpId: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(mcpImageMap, mcpId)) {
    return undefined;
  }

  return mcpImageMap[mcpId as KnownMcpId];
}
