import { Router } from "express";
import { organizationServiceTokenRoutes } from "../service-tokens/index.js";
import {
  controllerAddOrganizationMember,
  controllerDeleteOrganizationMember,
  controllerListOrganizationMembers,
  controllerUpdateOrganizationMember
} from "./controller.js";

export const organizationMemberRoutes: Router = Router({ mergeParams: true });
organizationMemberRoutes.get("/", controllerListOrganizationMembers);
organizationMemberRoutes.post("/", controllerAddOrganizationMember);
organizationMemberRoutes.patch("/:memberId", controllerUpdateOrganizationMember);
organizationMemberRoutes.delete("/:memberId", controllerDeleteOrganizationMember);
organizationMemberRoutes.use("/:userId/service-tokens", organizationServiceTokenRoutes);
export default organizationMemberRoutes;
