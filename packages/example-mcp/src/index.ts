import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { register as registerAddTool } from "./tools/add.js";

const mcp = new McpToolkit({
    name: "example-mcp",
    description: "an example mcp toolkit",
    version: "v1.0.1"
})

registerAddTool(mcp);

const f: McpToolkitRegister = {
    register: mcp.registerMcp
}

export default f
