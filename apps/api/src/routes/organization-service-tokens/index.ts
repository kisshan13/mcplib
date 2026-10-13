import { Router } from "express";
import {
  controllerListOrganizationServiceTokens,
  controllerRegisterOrganizationServiceToken,
  controllerRevokeOrganizationServiceToken
} from "./controller.js";

export const organizationServiceTokenRoutes: Router = Router({ mergeParams: true });
organizationServiceTokenRoutes.get("/", controllerListOrganizationServiceTokens);
organizationServiceTokenRoutes.post("/", controllerRegisterOrganizationServiceToken);
organizationServiceTokenRoutes.delete("/:tokenId", controllerRevokeOrganizationServiceToken);
export default organizationServiceTokenRoutes;
