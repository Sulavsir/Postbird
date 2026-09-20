import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../../middlewares/upload.middleware.js";
import {
  deleteAttachment,
  downloadAttachment,
  listAttachmentsHandler,
  uploadAttachment,
} from "./attachments.controller.js";

export const attachmentsRouter = Router();
attachmentsRouter.use(authenticate);
attachmentsRouter.get("/", listAttachmentsHandler);
attachmentsRouter.post("/", uploadMiddleware.single("file"), uploadAttachment);
attachmentsRouter.get("/:id/download", downloadAttachment);
attachmentsRouter.delete("/:id", deleteAttachment);
