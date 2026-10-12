import { Router } from "express";
import organizationMemberRoutes from "../organization-members/index.js";
import organizationProfileRoutes from "../organization-profiles/index.js";
import {
  controllerCreateOrganization,
  controllerGetOrganization,
  controllerListOrganizations,
  controllerUpdateOrganization
} from "./controller.js";

export function factoryOrganizationRouter(): Router {
  const router = Router();

  router.get("/", controllerListOrganizations);
  router.post("/", controllerCreateOrganization);
  router.use("/:organizationId/members", organizationMemberRoutes);
  router.use("/:organizationId/profiles", organizationProfileRoutes);
  router.get("/:id", controllerGetOrganization);
  router.patch("/:id", controllerUpdateOrganization);

  return router;
}
