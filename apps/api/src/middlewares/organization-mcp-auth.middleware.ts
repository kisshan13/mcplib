import type { RequestHandler } from "express";
import { OAuthOwnershipType } from "@packages/prisma";
import { authenticateMcpApiKey } from "../lib/mcp-api-key-auth.js";

export default function organizationMcpAuthMiddleware(): RequestHandler {
  return async (req, _res, next) => {
    try {
      await authenticateMcpApiKey({
        request: req,
        mcpId: typeof req.params.mcpId === "string" ? req.params.mcpId : "",
        ownershipType: OAuthOwnershipType.ORGANIZATION,
        organizationId:
          typeof req.params.organizationId === "string" ? req.params.organizationId : ""
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}
