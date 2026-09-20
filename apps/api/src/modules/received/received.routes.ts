import { Router } from "express";
import { imapSyncSchema } from "@postbird/shared";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  listReceivedHandler,
  syncReceivedHandler,
} from "./received.controller.js";

export const receivedRouter = Router();
receivedRouter.use(authenticate);
receivedRouter.get("/", listReceivedHandler);
receivedRouter.post("/sync", validate(imapSyncSchema), syncReceivedHandler);
