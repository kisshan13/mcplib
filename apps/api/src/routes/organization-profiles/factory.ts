import { Router } from "express";
import organizationProfileServiceTokenRoutes from "../organization-profile-service-tokens/index.js";
import {
  controllerCreateOrganizationProfile,
  controllerDeleteOrganizationProfile,
  controllerGetOrganizationProfile,
  controllerListOrganizationProfiles,
  controllerUpdateOrganizationProfile
} from "./controller.js";

export function factoryOrganizationProfileRouter(): Router {
  const router = Router({ mergeParams: true });
  router.get("/", controllerListOrganizationProfiles);
  router.post("/", controllerCreateOrganizationProfile);
  router.get("/:profileId", controllerGetOrganizationProfile);
  router.patch("/:profileId", controllerUpdateOrganizationProfile);
  router.delete("/:profileId", controllerDeleteOrganizationProfile);
  router.use("/:profileId/service-tokens", organizationProfileServiceTokenRoutes);
  return router;
}
