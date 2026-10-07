import type { Request, Response } from "express";
import { z } from "zod";

import { McpServer, type ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export interface McpToolkitOpts {
    name: string;
    version: string;
    description?: string;
}

export interface McpToolkitRegister {
    register: (req: Request, res: Response) => Promise<void>
}

interface ToolDefinition<
    TInput extends z.ZodTypeAny,
    TOutput extends z.ZodTypeAny,
> {
    name: string;
    description: string;
    inputSchema: TInput;
    outputSchema: TOutput;

    execute(input: z.infer<TInput>): Promise<z.infer<TOutput>>;
}

export class McpToolkit {
    private readonly serverOptions: McpToolkitOpts;
    private readonly registerToolHandlers: Array<(server: McpServer) => void> = [];

    constructor(opts: McpToolkitOpts) {
        this.serverOptions = opts;
    }

    registerTool<
        TInput extends z.ZodTypeAny,
        TOutput extends z.ZodTypeAny
    >(
        definition: ToolDefinition<TInput, TOutput>,
    ): this {
        const callback: ToolCallback<z.ZodTypeAny> = async (input: unknown) => {
            const result = await definition.execute(input as z.infer<TInput>);

            return {
                structuredContent: result as Record<string, unknown>,
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(result),
                    },
                ],
            };
        };

        this.registerToolHandlers.push((server) => {
            server.registerTool(
                definition.name,
                {
                    description: definition.description,
                    inputSchema: definition.inputSchema,
                    outputSchema: definition.outputSchema,
                },
                callback as ToolCallback<TInput>,
            );
        });

        return this;
    }

    registerMcp = async (req: Request, res: Response): Promise<void> => {
        const server = new McpServer({
            name: this.serverOptions.name,
            version: this.serverOptions.version,
            description: this.serverOptions.description,
        });
        this.registerToolHandlers.forEach((registerTool) => registerTool(server));

        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });

        res.on("close", () => {
            void transport.close();
            void server.close();
        });

        await server.connect(transport);

        await transport.handleRequest(req, res, req.body);
    };
}
