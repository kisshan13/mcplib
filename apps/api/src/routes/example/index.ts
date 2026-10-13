import { Router } from "express";
import { controllerGetExample } from "./controller.js";

export const exampleRoutes: Router = Router();
exampleRoutes.get("/", controllerGetExample);

export default exampleRoutes;
