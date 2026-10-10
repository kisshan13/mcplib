import { Router } from "express";
import authMiddleware from "./middlewares/auth.middleware.js";
import organizationMcpAuthMiddleware from "./middlewares/organization-mcp-auth.middleware.js";
import platformMcpAuthMiddleware from "./middlewares/platform-mcp-auth.middleware.js";
import {
  exampleMcpHandler,
  organizationMcpHandler,
  platformMcpHandler
} from "./registry/mcp-registry.js";

const mcpRoutes: Router = Router();

mcpRoutes.all("/platform/mcp/:mcp-id", platformMcpAuthMiddleware(), platformMcpHandler);
mcpRoutes.all(
  "/mcp/:organization-id/:mcp-id",
  organizationMcpAuthMiddleware(),
  organizationMcpHandler
);

// Preserve the existing authenticated example endpoint.
mcpRoutes.all("/example/mcp", authMiddleware(), exampleMcpHandler);

export default mcpRoutes;
