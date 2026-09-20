import type { SmtpProvider, SmtpSecurity } from "@prisma/client";
import {
  resolveSmtpEndpoint,
  type SmtpConfigurationInput,
  type SmtpUpdateInput,
} from "@postbird/shared";
import { prisma } from "../../lib/prisma.js";
import { decryptSmtpSecret, encrypt } from "../../utils/encryption.js";
import { AppError, NotFoundError } from "../../utils/errors.js";
import { toSmtpError } from "../../utils/smtp-error.js";
import { verifyTransport } from "../../integrations/smtp/index.js";

const publicSelect = {
  id: true,
  provider: true,
  label: true,
  host: true,
  port: true,
  security: true,
  username: true,
  isEnabled: true,
  lastVerifiedAt: true,
  createdAt: true,
} as const;

function toPublic(record: {
  id: string;
  provider: SmtpProvider;
  label: string;
  host: string;
  port: number;
  security: SmtpSecurity;
  username: string;
  isEnabled: boolean;
  lastVerifiedAt: Date | null;
  createdAt?: Date;
}) {
  return { ...record, hasPassword: true };
}

export async function listConfigurations(userId: string) {
  const records = await prisma.smtpConfiguration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: publicSelect,
  });
  return records.map(toPublic);
}

export async function createConfiguration(
  userId: string,
  input: SmtpConfigurationInput,
) {
  const { password, ...data } = input;
  const record = await prisma.smtpConfiguration.create({
    data: {
      ...data,
      userId,
      encryptedSecret: encrypt(password),
    },
    select: publicSelect,
  });
  return toPublic(record);
}

export async function updateConfiguration(
  userId: string,
  id: string,
  input: SmtpUpdateInput,
) {
  const existing = await prisma.smtpConfiguration.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new NotFoundError("SMTP configuration");
  const provider = input.provider ?? existing.provider;
  const endpoint = resolveSmtpEndpoint(provider, {
    host: input.host ?? existing.host,
    port: input.port ?? existing.port,
    security: input.security ?? existing.security,
  });
  if (provider === "CUSTOM" && !endpoint.host) {
    throw new AppError("VALIDATION_ERROR", "Host is required for custom SMTP", 422);
  }
  const record = await prisma.smtpConfiguration.update({
    where: { id: existing.id },
    data: {
      provider,
      label: input.label ?? existing.label,
      host: endpoint.host,
      port: endpoint.port,
      security: endpoint.security,
      username: input.username ?? existing.username,
      isEnabled: input.isEnabled ?? existing.isEnabled,
      ...(input.password ? { encryptedSecret: encrypt(input.password) } : {}),
    },
    select: publicSelect,
  });
  return toPublic(record);
}

export async function deleteConfiguration(userId: string, id: string) {
  const existing = await prisma.smtpConfiguration.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new NotFoundError("SMTP configuration");
  await prisma.email.updateMany({
    where: { smtpConfigurationId: existing.id, userId },
    data: { smtpConfigurationId: null },
  });
  await prisma.smtpConfiguration.delete({ where: { id: existing.id } });
  return { deleted: true, id: existing.id };
}

export async function testConfiguration(userId: string, id: string) {
  const record = await prisma.smtpConfiguration.findFirst({
    where: { id, userId },
  });
  if (!record) throw new NotFoundError("SMTP configuration");
  try {
    await verifyTransport(
      {
        provider: record.provider,
        label: record.label,
        host: record.host,
        port: record.port,
        security: record.security,
        username: record.username,
        isEnabled: record.isEnabled,
      },
      decryptSmtpSecret(record.encryptedSecret),
    );
  } catch (error) {
    throw toSmtpError(error);
  }
  await prisma.smtpConfiguration.update({
    where: { id: record.id },
    data: { lastVerifiedAt: new Date() },
  });
  return { verified: true };
}

export type PublicSmtpConfiguration = ReturnType<typeof toPublic>;
