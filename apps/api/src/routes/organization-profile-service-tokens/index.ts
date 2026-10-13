import { Router } from "express";
import {
  controllerListOrganizationProfileServiceTokens,
  controllerRegisterOrganizationProfileServiceToken,
  controllerRevokeOrganizationProfileServiceToken
} from "./controller.js";

export const organizationProfileServiceTokenRoutes: Router = Router({ mergeParams: true });
organizationProfileServiceTokenRoutes.get("/", controllerListOrganizationProfileServiceTokens);
organizationProfileServiceTokenRoutes.post("/", controllerRegisterOrganizationProfileServiceToken);
organizationProfileServiceTokenRoutes.delete(
  "/:tokenId",
  controllerRevokeOrganizationProfileServiceToken
);
export default organizationProfileServiceTokenRoutes;
