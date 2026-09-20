import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { clickRedirect, getStats, openPixel } from "./tracking.controller.js";

export const trackingRouter = Router();
trackingRouter.get("/stats", authenticate, getStats);
trackingRouter.get("/open/:trackingId", openPixel);
trackingRouter.get("/click/:trackingId", clickRedirect);
