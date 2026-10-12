import { Router } from "express";
import organizationServiceTokenRoutes from "../organization-service-tokens/index.js";
import {
  controllerAddOrganizationMember,
  controllerDeleteOrganizationMember,
  controllerListOrganizationMembers,
  controllerUpdateOrganizationMember
} from "./controller.js";

export function factoryOrganizationMemberRouter(): Router {
  const router = Router({ mergeParams: true });
  router.get("/", controllerListOrganizationMembers);
  router.post("/", controllerAddOrganizationMember);
  router.patch("/:memberId", controllerUpdateOrganizationMember);
  router.delete("/:memberId", controllerDeleteOrganizationMember);
  router.use("/:userId/service-tokens", organizationServiceTokenRoutes);
  return router;
}
