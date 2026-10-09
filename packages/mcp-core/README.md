# `@packages/mcp-core`

`@packages/mcp-core` is a small TypeScript toolkit for exposing typed tools through an [MCP](https://modelcontextprotocol.io/) server mounted in an Express application.

It wraps the official MCP SDK and provides:

- server metadata through `McpToolkit`
- Zod input and output schemas for tools
- type inference from each tool's input schema
- an Express-compatible Streamable HTTP handler
- stateless MCP requests with no server-side session storage
- explicit per-request `SecretProvider` access for MCP tools

The package is currently a private workspace package in this monorepo.

## Requirements

- Node.js 20.19 or newer
- pnpm 10 or newer
- an Express application

## Installation

From another package in this workspace, add the dependency with:

```bash
pnpm add @packages/mcp-core@workspace:*
```

The package uses `zod` for schemas and expects Express request and response objects when the MCP handler is mounted.

## Quick start

Create a toolkit, register one or more tools, and export its Express handler:

```ts
// packages/example-mcp/src/index.ts
import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { z } from "zod";

const mcp = new McpToolkit({
  name: "example-mcp",
  version: "1.0.0",
  description: "An example MCP server"
});

mcp.registerTool({
  name: "add",
  description: "Adds two numbers",
  inputSchema: z.object({
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number")
  }),
  outputSchema: z.object({
    result: z.number().describe("The sum of a and b")
  }),
  async execute(input) {
    return { result: input.a + input.b };
  }
});

const register: McpToolkitRegister = mcp.asRegister();

export default register;
```

Mount the handler in Express:

```ts
import express from "express";
import exampleMcp from "@packages/example-mcp";

const app = express();

// The MCP transport reads JSON request bodies.
app.use(express.json());

app.use("/api/v1/example/mcp", (req, res) => {
  return exampleMcp.register(req, res);
});

app.listen(3000);
```

Clients can connect to the mounted URL:

```text
http://localhost:3000/api/v1/example/mcp
```

`registerMcp` is an Express request handler for MCP Streamable HTTP traffic. Mount it with `app.use` so the transport can handle the MCP methods sent to the endpoint.

`asRegister()` also exposes safe public metadata and tool descriptors for a platform registry. Descriptors include each tool's name, description, input schema, and output schema; they do not include handlers, credentials, or runtime context.

## Registering tools

`registerTool` accepts a tool definition with four fields:

| Field          | Type                         | Description                                          |
| -------------- | ---------------------------- | ---------------------------------------------------- |
| `name`         | `string`                     | Name exposed to MCP clients.                         |
| `description`  | `string`                     | Human-readable description shown to clients.         |
| `inputSchema`  | `z.ZodType`                  | Zod schema describing and validating the tool input. |
| `outputSchema` | `z.ZodType`                  | Zod schema describing the tool result.               |
| `execute`      | `(input) => Promise<output>` | Async implementation of the tool.                    |

The input parameter of `execute` is inferred from `inputSchema`, and the return value is inferred from `outputSchema`:

```ts
mcp.registerTool({
  name: "greet",
  description: "Greets a person",
  inputSchema: z.object({
    name: z.string()
  }),
  outputSchema: z.object({
    message: z.string()
  }),
  async execute(input) {
    // input is inferred as { name: string }.
    return { message: `Hello, ${input.name}!` };
  }
});
```

Return an object-shaped result for compatibility with MCP structured content. The same result is also serialized as text for clients that consume the tool's text content.

Tool registration is chainable, so multiple tools can also be registered inline:

```ts
mcp.registerTool(firstTool).registerTool(secondTool);
```

Register tools during application setup, before handling requests. The toolkit applies the registered definitions whenever it creates an MCP server for a request.

## API

### `new McpToolkit(options)`

Creates a toolkit with the MCP server metadata:

```ts
interface McpToolkitOpts {
  id?: string;
  name: string;
  version: string;
  description?: string;
  serviceProvider?: string;
  supportedAuthMethods?: readonly string[];
  requiredScopes?: readonly string[];
  capabilities?: readonly string[];
  configurationRequirements?: readonly string[];
}
```

`name` and `version` are required. `description` is optional.

### `mcp.registerTool(definition)`

Registers a Zod-typed tool and returns the same `McpToolkit` instance. The tool's `execute` function may throw or reject; the MCP SDK then reports the failed request to the client.

### `mcp.getTools()`

Returns public descriptors for registered tools. These descriptors are suitable for a catalog endpoint and contain no executable tool handlers.

### `mcp.registerMcp(req, res)`

Handles one MCP request using Express's `Request` and `Response` objects:

```ts
(req: Request, res: Response) => Promise<void>;
```

The handler creates a Streamable HTTP transport without a session ID, connects an MCP server, registers the toolkit's tools, and delegates the request to the official MCP transport.

### `McpToolkitRegister`

An exported type useful when a package exposes its MCP server to an application:

```ts
interface McpToolkitRegister {
  register: (req: Request, res: Response) => Promise<void>;
}
```

## Project layout recommendation

Keep the toolkit setup separate from individual tool implementations:

```text
src/
├── index.ts          # Creates the toolkit and exports the handler
└── tools/
    ├── add.ts        # Registers the add tool
    └── search.ts     # Registers the search tool
```

A tool module can expose a registration function:

```ts
import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";

export function registerSearchTool(mcp: McpToolkit) {
  mcp.registerTool({
    name: "search",
    description: "Searches for matching records",
    inputSchema: z.object({ query: z.string().min(1) }),
    outputSchema: z.object({ results: z.array(z.string()) }),
    async execute({ query }) {
      return { results: [`Match for: ${query}`] };
    }
  });
}
```

## Development commands

Run these commands from the repository root:

```bash
# Type-check this package
pnpm --filter @packages/mcp-core typecheck

# Build declarations and JavaScript into build/
pnpm --filter @packages/mcp-core build

# Check the complete workspace
pnpm run typecheck
pnpm run build
```

The package exports TypeScript source for workspace type resolution and built JavaScript from `build/` at runtime.

## Related packages

- [`@packages/example-mcp`](../example-mcp) — a working toolkit with an `add` tool
- [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) — the underlying MCP TypeScript SDK
