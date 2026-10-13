import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  controllerGetMcpConfiguration,
  controllerGetMcpRegistryEntry,
  controllerListMcpConfigurationStatuses,
  controllerListMcpRegistry,
  controllerListMcpTools,
  controllerUpsertMcpConfiguration,
  controllerUpsertMcpDirectCredential
} from "./controller.js";

export const mcpRegistryRoutes: Router = Router();
mcpRegistryRoutes.get("/", controllerListMcpRegistry);
mcpRegistryRoutes.get(
  "/configuration/status",
  authMiddleware(),
  controllerListMcpConfigurationStatuses
);
mcpRegistryRoutes.get("/:id/configuration", authMiddleware(), controllerGetMcpConfiguration);
mcpRegistryRoutes.put("/:id/configuration", authMiddleware(), controllerUpsertMcpConfiguration);
mcpRegistryRoutes.put("/:id/credential", authMiddleware(), controllerUpsertMcpDirectCredential);
mcpRegistryRoutes.get("/:id/tools", controllerListMcpTools);
mcpRegistryRoutes.get("/:id", controllerGetMcpRegistryEntry);

export default mcpRegistryRoutes;
