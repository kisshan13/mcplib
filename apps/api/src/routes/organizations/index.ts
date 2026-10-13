import { Router } from "express";
import organizationMemberRoutes from "../organization-members/index.js";
import organizationProfileRoutes from "../organization-profiles/index.js";
import {
  controllerCreateOrganization,
  controllerGetOrganization,
  controllerListOrganizations,
  controllerUpdateOrganization
} from "./controller.js";

export const organizationRoutes: Router = Router();
organizationRoutes.get("/", controllerListOrganizations);
organizationRoutes.post("/", controllerCreateOrganization);
organizationRoutes.use("/:organizationId/members", organizationMemberRoutes);
organizationRoutes.use("/:organizationId/profiles", organizationProfileRoutes);
organizationRoutes.get("/:id", controllerGetOrganization);
organizationRoutes.patch("/:id", controllerUpdateOrganization);

export default organizationRoutes;
