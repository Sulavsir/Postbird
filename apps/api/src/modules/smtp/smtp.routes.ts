import { Router } from "express";
import { smtpConfigurationSchema, smtpUpdateSchema } from "@postbird/shared";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createSmtp,
  deleteSmtp,
  listSmtp,
  testSmtp,
  updateSmtp,
} from "./smtp.controller.js";

export const smtpRouter = Router();
smtpRouter.use(authenticate);
smtpRouter.get("/", listSmtp);
smtpRouter.post("/", validate(smtpConfigurationSchema), createSmtp);
smtpRouter.patch("/:id", validate(smtpUpdateSchema), updateSmtp);
smtpRouter.delete("/:id", deleteSmtp);
smtpRouter.post("/:id/test", testSmtp);
