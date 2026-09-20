import fs from "node:fs/promises";
import type { RequestHandler } from "express";
import { AppError } from "../../utils/errors.js";
import {
  createAttachment,
  deleteOwnedAttachment,
  getOwnedAttachment,
  listAttachments,
  publicAttachment,
} from "./attachments.service.js";

export const listAttachmentsHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await listAttachments(request.userId!);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    if (!request.file) {
      throw new AppError("FILE_INVALID", "No valid file was uploaded", 422);
    }
    const attachment = await createAttachment(request.userId!, request.file);
    response.status(201).json({
      success: true,
      data: publicAttachment(attachment),
      message: "Attachment uploaded",
    });
  } catch (error) {
    if (request.file?.path) await fs.rm(request.file.path, { force: true });
    next(error);
  }
};

export const downloadAttachment: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const { attachment, filePath } = await getOwnedAttachment(
      request.userId!,
      String(request.params.id),
    );
    response.download(filePath, attachment.originalName);
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await deleteOwnedAttachment(
      request.userId!,
      String(request.params.id),
    );
    response.json({
      success: true,
      data,
      message: "Attachment deleted",
    });
  } catch (error) {
    next(error);
  }
};
