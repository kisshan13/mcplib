import type { RequestHandler } from "express";

/**
 * Organization MCP authentication will be implemented here.
 * This flow remains separate from platform API-key authentication.
 */
export default function organizationMcpAuthMiddleware(): RequestHandler {
  return (_req, _res, next) => {
    next();
  };
}
