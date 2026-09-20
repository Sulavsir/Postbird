import { Router } from "express";
import { sendEmailSchema } from "@postbird/shared";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  deleteEmailHandler,
  getEmailHandler,
  listEmailsHandler,
  sendEmailHandler,
} from "./email.controller.js";

export const emailRouter = Router();
emailRouter.use(authenticate);
emailRouter.get("/", listEmailsHandler);
emailRouter.post("/send", validate(sendEmailSchema), sendEmailHandler);
emailRouter.get("/:id", getEmailHandler);
emailRouter.delete("/:id", deleteEmailHandler);
