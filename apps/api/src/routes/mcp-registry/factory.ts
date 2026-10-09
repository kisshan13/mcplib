import { Router } from "express";
import {
  controllerGetMcpRegistryEntry,
  controllerListMcpTools,
  controllerListMcpRegistry
} from "./controller.js";

export function factoryMcpRegistryRouter(): Router {
  const router = Router();

  router.get("/", controllerListMcpRegistry);
  router.get("/:id/tools", controllerListMcpTools);
  router.get("/:id", controllerGetMcpRegistryEntry);

  return router;
}
