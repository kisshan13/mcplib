import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";

export function register(mcp: McpToolkit) {
  mcp.registerTool({
    name: "add",
    description: "adds two numbers a + b",
    inputSchema: z.object({
        a: z.number().describe("A number to add"),
        b: z.number().describe("A number to add")
    }),
    outputSchema: z.object({
        result: z.number().describe("Answer a + b")
    }),
    async execute(input) {
        return {
            result: input.a + input.b
        }
    },
  });
}
