import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { register as registerAddTool } from "./tools/add.js";
import { registerCredentialStatusTool } from "./tools/credential-status.js";

const mcp = new McpToolkit({
  id: "example-mcp",
  name: "example-mcp",
  description: "an example mcp toolkit",
  version: "v1.0.1",
  displayName: "Example MCP",
  serviceProvider: "example-service",
  capabilities: ["tools"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "direct",
    secretId: "default",
    inputSchema: z.object({
      apiKey: z.string().min(1).describe("The example service API key.")
    })
  })
});

registerAddTool(mcp);
registerCredentialStatusTool(mcp);

const f: McpToolkitRegister = mcp.asRegister();

export default f;
