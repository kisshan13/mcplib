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

export const apiKeyRoutes: Router = Router();
apiKeyRoutes.use(authMiddleware());
apiKeyRoutes.get("/", controllerListApiKeys);
apiKeyRoutes.post("/", controllerCreateApiKey);
apiKeyRoutes.get("/:keyId", controllerGetApiKey);
apiKeyRoutes.post("/:keyId/revoke", controllerRevokeApiKey);
apiKeyRoutes.get("/:keyId/mcp-access", controllerListApiKeyMcpAccess);
apiKeyRoutes.post("/:keyId/mcp-access", controllerGrantApiKeyMcpAccess);
apiKeyRoutes.delete("/:keyId/mcp-access/:mcpId", controllerRevokeApiKeyMcpAccess);

export default apiKeyRoutes;
