import { Router } from "express";
import {
  controllerListOrganizationProfileServiceTokens,
  controllerRegisterOrganizationProfileServiceToken,
  controllerRevokeOrganizationProfileServiceToken
} from "./controller.js";

export function factoryOrganizationProfileServiceTokenRouter(): Router {
  const router = Router({ mergeParams: true });
  router.get("/", controllerListOrganizationProfileServiceTokens);
  router.post("/", controllerRegisterOrganizationProfileServiceToken);
  router.delete("/:tokenId", controllerRevokeOrganizationProfileServiceToken);
  return router;
}
