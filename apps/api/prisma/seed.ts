import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  type SmtpProvider,
  type SmtpSecurity,
} from "@prisma/client";
import { encrypt } from "../src/utils/encryption.js";

const prisma = new PrismaClient();
const SEED_SMTP_ID = "00000000-0000-0000-0000-000000000001";

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

  const seedSmtp = process.env.SEED_SMTP === "true";
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();

  if (!seedSmtp || !smtpUser || !smtpPassword) {
    await prisma.email.deleteMany({
      where: { smtpConfigurationId: SEED_SMTP_ID },
    });
    await prisma.smtpConfiguration.deleteMany({
      where: { id: SEED_SMTP_ID },
    });
    console.log(
      `Seeded demo user ${user.email} with no SMTP. Add a connection in the UI, or set SEED_SMTP=true with SMTP_USER and SMTP_PASSWORD to seed one.`,
    );
    return;
  }

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

  await prisma.smtpConfiguration.upsert({
    where: { id: SEED_SMTP_ID },
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
      id: SEED_SMTP_ID,
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
    `Seeded demo user ${user.email} with SMTP ${smtpHost}:${smtpPort} for ${smtpUser} because SEED_SMTP=true.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
