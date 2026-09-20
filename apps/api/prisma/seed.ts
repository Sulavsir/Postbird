import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  type SmtpProvider,
  type SmtpSecurity,
} from "@prisma/client";
import { encrypt } from "../src/utils/encryption.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("change-me-before-use", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@postbird.local" },
    update: {},
    create: {
      email: "demo@postbird.local",
      displayName: "Demo User",
      passwordHash,
    },
  });

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpSecurity = (process.env.SMTP_SECURITY?.trim() ||
    (smtpPort === 465 ? "TLS" : "STARTTLS")) as SmtpSecurity;
  const provider: SmtpProvider = smtpHost.includes("gmail.com")
    ? "GMAIL"
    : smtpHost.includes("yahoo.")
      ? "YAHOO"
      : smtpHost.includes("office365") || smtpHost.includes("outlook")
        ? "MICROSOFT"
        : "CUSTOM";

  if (smtpUser && smtpPassword) {
    await prisma.smtpConfiguration.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {
        userId: user.id,
        provider,
        label: `${provider}`,
        host: smtpHost,
        port: smtpPort,
        security: smtpSecurity,
        username: smtpUser,
        encryptedSecret: encrypt(smtpPassword),
        isEnabled: true,
      },
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        userId: user.id,
        provider,
        label: `${provider}`,
        host: smtpHost,
        port: smtpPort,
        security: smtpSecurity,
        username: smtpUser,
        encryptedSecret: encrypt(smtpPassword),
        isEnabled: true,
      },
    });
    console.log(
      `Seeded demo user ${user.email} with enabled SMTP ${smtpHost}:${smtpPort} for ${smtpUser}.`,
    );
    return;
  }

  await prisma.smtpConfiguration.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      userId: user.id,
      provider: "CUSTOM",
      label: "Local SMTP placeholder",
      host: "localhost",
      port: 1025,
      security: "NONE",
      username: "demo@postbird.local",
      encryptedSecret: "seed-placeholder",
      isEnabled: false,
    },
  });
  console.log(
    `Seeded demo user ${user.email}. The placeholder SMTP configuration is disabled.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
