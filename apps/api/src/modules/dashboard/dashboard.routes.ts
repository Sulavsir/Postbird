import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getDashboardHandler } from "./dashboard.controller.js";

export const dashboardRouter = Router();
dashboardRouter.get("/", authenticate, getDashboardHandler);
