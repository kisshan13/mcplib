import { Router } from "express";
import { organizationProfileServiceTokenRoutes } from "../service-tokens/index.js";
import {
  controllerCreateOrganizationProfile,
  controllerDeleteOrganizationProfile,
  controllerGetOrganizationProfile,
  controllerListOrganizationProfiles,
  controllerUpdateOrganizationProfile
} from "./controller.js";

export const organizationProfileRoutes: Router = Router({ mergeParams: true });
organizationProfileRoutes.get("/", controllerListOrganizationProfiles);
organizationProfileRoutes.post("/", controllerCreateOrganizationProfile);
organizationProfileRoutes.get("/:profileId", controllerGetOrganizationProfile);
organizationProfileRoutes.patch("/:profileId", controllerUpdateOrganizationProfile);
organizationProfileRoutes.delete("/:profileId", controllerDeleteOrganizationProfile);
organizationProfileRoutes.use("/:profileId/service-tokens", organizationProfileServiceTokenRoutes);
export default organizationProfileRoutes;
