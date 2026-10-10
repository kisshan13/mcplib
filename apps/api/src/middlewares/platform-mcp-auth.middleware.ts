import type { RequestHandler } from "express";

/**
 * Platform MCP API-key authentication will be implemented here.
 * This middleware is mounted only on the platform MCP route.
 */
export default function platformMcpAuthMiddleware(): RequestHandler {
  return (_req, _res, next) => {
    next();
  };
}
