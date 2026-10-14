import { McpToolkit, type McpRuntimeContext } from "@packages/mcp-core";
import { z } from "zod";

type ErasedToolDefinition = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
  execute(input: z.infer<z.ZodAny>, context: McpRuntimeContext): Promise<z.infer<z.ZodAny>>;
};

/** Keeps generated Google API types out of McpToolkit's registration inference. */
export function registerGoogleTool(mcp: McpToolkit, definition: ErasedToolDefinition): void {
  mcp.registerTool(definition as never);
}
