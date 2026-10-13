import { Router } from "express";
import {
  controllerListOrganizationProfileServiceTokens,
  controllerRegisterOrganizationProfileServiceToken,
  controllerRevokeOrganizationProfileServiceToken,
  controllerListOrganizationServiceTokens,
  controllerRegisterOrganizationServiceToken,
  controllerRevokeOrganizationServiceToken
} from "./controller.js";

export const organizationServiceTokenRoutes: Router = Router({ mergeParams: true });
organizationServiceTokenRoutes.get("/", controllerListOrganizationServiceTokens);
organizationServiceTokenRoutes.post("/", controllerRegisterOrganizationServiceToken);
organizationServiceTokenRoutes.delete("/:tokenId", controllerRevokeOrganizationServiceToken);

export const organizationProfileServiceTokenRoutes: Router = Router({ mergeParams: true });
organizationProfileServiceTokenRoutes.get("/", controllerListOrganizationProfileServiceTokens);
organizationProfileServiceTokenRoutes.post("/", controllerRegisterOrganizationProfileServiceToken);
organizationProfileServiceTokenRoutes.delete(
  "/:tokenId",
  controllerRevokeOrganizationProfileServiceToken
);
