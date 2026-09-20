import type { ImapSyncInput } from "@postbird/shared";
import { prisma } from "../../lib/prisma.js";
import { ImapService } from "../../integrations/imap/imap.service.js";
import { NotFoundError } from "../../utils/errors.js";

export async function deleteReceived(userId: string, id: string) {
  const existing = await prisma.receivedEmail.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new NotFoundError("Received email");
  }
  await prisma.receivedEmail.delete({ where: { id: existing.id } });
  return { deleted: true, id: existing.id };
}

export async function listReceived(userId: string) {
  return prisma.receivedEmail.findMany({
    where: { userId },
    orderBy: { receivedAt: "desc" },
    take: 100,
  });
}

export async function syncReceived(userId: string, config: ImapSyncInput) {
  const service = new ImapService(config);
  try {
    const messages = await service.syncInbox();
    const saved = await prisma.$transaction(
      messages.map((message) =>
        prisma.receivedEmail.upsert({
          where: {
            userId_uid: { userId, uid: String(message.uid) },
          },
          create: {
            userId,
            uid: String(message.uid),
            messageId: message.messageId,
            from: message.from,
            subject: message.subject,
            receivedAt: message.receivedAt,
          },
          update: {
            messageId: message.messageId,
            from: message.from,
            subject: message.subject,
            receivedAt: message.receivedAt,
          },
        }),
      ),
    );
    return { synced: saved.length };
  } finally {
    await service.close().catch(() => undefined);
  }
}
