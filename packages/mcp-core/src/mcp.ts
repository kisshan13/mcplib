import type { Request, Response } from "express";
import { z, type ZodRawShape, type ZodType } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export interface McpToolkitOpts {
    name: string;
    version: string;
    description?: string;
}

interface ToolDefinition<
    TInput extends z.AnyZodObject,
    TOutput extends z.AnyZodObject,
> {
    name: string;
    description: string;

    inputSchema: TInput;
    outputSchema: TOutput;

    execute(input: z.infer<TInput>): Promise<z.infer<TOutput>>;
}

export class McpToolkit {
    private readonly server: McpServer;

    constructor(opts: McpToolkitOpts) {
        this.server = new McpServer({
            name: opts.name,
            version: opts.version,
            description: opts.description,
        });
    }

    registerTool<TInput extends z.ZodRawShapeCompat, TOutput extends z.AnyZodObject>(definition: ToolDefinition<TInput, TOutput>): this {
        this.server.registerTool(
            definition.name,
            {
                description: definition.description,

                inputSchema: definition.inputSchema,

                outputSchema: definition.outputSchema,
            },
            async (input: any) => {
                const result = await definition.execute(input as z.infer<TInput>);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result),
                        },
                    ],
                };
            },
        );

        return this;
    }

    async registerMcp(req: Request, res: Response): Promise<void> {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });

        res.on("close", () => {
            void transport.close();
        });

        await this.server.connect(transport);

        await transport.handleRequest(req, res);
    }
}
