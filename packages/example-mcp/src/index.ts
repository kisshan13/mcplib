import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { register as registerAddTool } from "./tools/add.js";
import { registerCredentialStatusTool } from "./tools/credential-status.js";

const mcp = new McpToolkit({
  id: "example-mcp",
  name: "example-mcp",
  description: "an example mcp toolkit",
  version: "v1.0.1",
  displayName: "Example MCP",
  serviceProvider: "example-service",
  supportedAuthMethods: ["bearer-token"],
  capabilities: ["tools"],
  configurationRequirements: ["example-service credential"]
});

registerAddTool(mcp);
registerCredentialStatusTool(mcp);

const f: McpToolkitRegister = mcp.asRegister();

export default f;
