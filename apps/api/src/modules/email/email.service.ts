import crypto from "node:crypto";
import path from "node:path";
import type { SendEmailInput } from "@postbird/shared";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { decrypt } from "../../utils/encryption.js";
import { AppError, NotFoundError } from "../../utils/errors.js";
import { toSmtpError } from "../../utils/smtp-error.js";
import { createTransport } from "../../integrations/smtp/index.js";

function rewriteTrackedLinks(body: string, trackingId: string): string {
  return body.replace(
    /href=["'](https?:\/\/[^"']+)["']/gi,
    (_match, url: string) =>
      `href="${env.API_URL}/api/tracking/click/${trackingId}?url=${encodeURIComponent(url)}"`,
  );
}

export async function listEmails(
  userId: string,
  page: number,
  limit: number,
) {
  const where = { userId };
  const [data, total] = await prisma.$transaction([
    prisma.email.findMany({
      where,
      include: {
        recipients: true,
        smtpConfiguration: { select: { label: true, provider: true } },
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.email.count({ where }),
  ]);
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getEmail(userId: string, id: string) {
  const email = await prisma.email.findFirst({
    where: { id, userId },
    include: {
      recipients: true,
      attachments: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
      trackingEvents: { orderBy: { createdAt: "desc" }, take: 50 },
      smtpConfiguration: {
        select: { id: true, label: true, provider: true, username: true },
      },
    },
  });
  if (!email) throw new NotFoundError("Email");
  return email;
}

export async function sendEmail(userId: string, payload: SendEmailInput) {
  const config = await prisma.smtpConfiguration.findFirst({
    where: {
      id: payload.smtpConfigurationId,
      userId,
      isEnabled: true,
    },
  });
  if (!config) {
    throw new AppError(
      "SMTP_NOT_FOUND",
      "Enabled SMTP configuration was not found",
      404,
    );
  }
  const attachments = await prisma.attachment.findMany({
    where: {
      id: { in: payload.attachmentIds ?? [] },
      userId,
    },
    select: {
      id: true,
      originalName: true,
      storageName: true,
      mimeType: true,
    },
  });
  if (attachments.length !== (payload.attachmentIds ?? []).length) {
    throw new AppError(
      "ATTACHMENT_NOT_FOUND",
      "One or more attachments were not found",
      422,
    );
  }
  const trackingId = crypto.randomUUID();
  const messageId = `<${crypto.randomUUID()}@postbird.local>`;
  const email = await prisma.email.create({
    data: {
      userId,
      smtpConfigurationId: config.id,
      trackingId,
      messageId,
      subject: payload.subject,
      body: payload.body,
      trackOpens: payload.trackOpens,
      trackClicks: payload.trackClicks,
      recipients: {
        create: [
          ...payload.to.map((address: string) => ({
            address,
            type: "TO" as const,
          })),
          ...payload.cc.map((address: string) => ({
            address,
            type: "CC" as const,
          })),
          ...payload.bcc.map((address: string) => ({
            address,
            type: "BCC" as const,
          })),
        ],
      },
    },
  });
  if (attachments.length) {
    await prisma.attachment.updateMany({
      where: { id: { in: attachments.map((item) => item.id) }, userId },
      data: { emailId: email.id },
    });
  }
  const transport = createTransport(
    {
      provider: config.provider,
      label: config.label,
      host: config.host,
      port: config.port,
      security: config.security,
      username: config.username,
      isEnabled: config.isEnabled,
    },
    decrypt(config.encryptedSecret),
  );
  const trackedBody = payload.trackClicks
    ? rewriteTrackedLinks(payload.body, trackingId)
    : payload.body;
  const trackingPixel = payload.trackOpens
    ? `<img src="${env.API_URL}/api/tracking/open/${trackingId}" width="1" height="1" alt="" />`
    : "";
  try {
    await transport.sendMail({
      from: config.username,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: `${trackedBody}${trackingPixel}`,
      text: payload.body,
      messageId,
      attachments: attachments.map((attachment) => ({
        filename: attachment.originalName,
        path: path.resolve(env.UPLOAD_DIR, attachment.storageName),
        contentType: attachment.mimeType,
      })),
    });
  } catch (error) {
    await prisma.email.update({
      where: { id: email.id },
      data: { status: "FAILED" },
    });
    throw toSmtpError(error);
  }
  const saved = await prisma.email.update({
    where: { id: email.id },
    data: { status: "SENT", sentAt: new Date() },
  });
  return { id: saved.id, status: saved.status, trackingId };
}

export async function deleteEmail(userId: string, id: string) {
  const email = await prisma.email.findFirst({
    where: { id, userId },
    select: { id: true, status: true },
  });
  if (!email) throw new NotFoundError("Email");
  await prisma.attachment.updateMany({
    where: { emailId: email.id, userId },
    data: { emailId: null },
  });
  await prisma.email.delete({ where: { id: email.id } });
  return { deleted: true, id: email.id, status: email.status };
}
