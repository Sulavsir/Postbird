import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError, NotFoundError } from "../../utils/errors.js";

export function publicAttachment(attachment: {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  emailId?: string | null;
}) {
  return {
    id: attachment.id,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    createdAt: attachment.createdAt,
    emailId: attachment.emailId ?? null,
  };
}

export async function listAttachments(userId: string) {
  const attachments = await prisma.attachment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
      emailId: true,
    },
  });
  return attachments.map(publicAttachment);
}

export async function createAttachment(
  userId: string,
  file: Express.Multer.File,
) {
  return prisma.attachment.create({
    data: {
      userId,
      originalName: path.basename(file.originalname).slice(0, 255),
      storageName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    },
  });
}

export async function getOwnedAttachment(userId: string, id: string) {
  const attachment = await prisma.attachment.findFirst({
    where: { id, userId },
  });
  if (!attachment) throw new NotFoundError("Attachment");
  const filePath = path.resolve(env.UPLOAD_DIR, attachment.storageName);
  const root = path.resolve(env.UPLOAD_DIR) + path.sep;
  if (!filePath.startsWith(root)) {
    throw new AppError("FILE_INVALID", "Invalid attachment path", 400);
  }
  return { attachment, filePath };
}

export async function deleteOwnedAttachment(userId: string, id: string) {
  const { attachment, filePath } = await getOwnedAttachment(userId, id);
  await prisma.attachment.delete({ where: { id: attachment.id } });
  await fs.rm(filePath, { force: true });
  return { deleted: true };
}
