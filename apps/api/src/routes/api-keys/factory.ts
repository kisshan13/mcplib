import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  controllerCreateApiKey,
  controllerGetApiKey,
  controllerGrantApiKeyMcpAccess,
  controllerListApiKeyMcpAccess,
  controllerListApiKeys,
  controllerRevokeApiKey,
  controllerRevokeApiKeyMcpAccess
} from "./controller.js";

export function factoryApiKeyRouter(): Router {
  const router = Router();
  router.use(authMiddleware());
  router.get("/", controllerListApiKeys);
  router.post("/", controllerCreateApiKey);
  router.get("/:keyId", controllerGetApiKey);
  router.post("/:keyId/revoke", controllerRevokeApiKey);
  router.get("/:keyId/mcp-access", controllerListApiKeyMcpAccess);
  router.post("/:keyId/mcp-access", controllerGrantApiKeyMcpAccess);
  router.delete("/:keyId/mcp-access/:mcpId", controllerRevokeApiKeyMcpAccess);
  return router;
}
