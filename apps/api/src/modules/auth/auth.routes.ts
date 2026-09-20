import { Router } from "express";
import { credentialsSchema, registrationSchema } from "@postbird/shared";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { login, me, register } from "./auth.controller.js";
import { authRateLimit } from "../../middlewares/rate-limit.middleware.js";

export const authRouter = Router();
authRouter.use(authRateLimit);
authRouter.post("/register", validate(registrationSchema), register);
authRouter.post("/login", validate(credentialsSchema), login);
authRouter.get("/me", authenticate, me);
