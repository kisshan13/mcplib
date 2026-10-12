import { Router } from "express";
import {
  controllerListOrganizationServiceTokens,
  controllerRegisterOrganizationServiceToken,
  controllerRevokeOrganizationServiceToken
} from "./controller.js";

export function factoryOrganizationServiceTokenRouter(): Router {
  const router = Router({ mergeParams: true });
  router.get("/", controllerListOrganizationServiceTokens);
  router.post("/", controllerRegisterOrganizationServiceToken);
  router.delete("/:tokenId", controllerRevokeOrganizationServiceToken);
  return router;
}
