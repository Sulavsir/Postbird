import type { ImapSyncInput } from "@postbird/shared";
import { prisma } from "../../lib/prisma.js";
import { ImapService } from "../../integrations/imap/imap.service.js";

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
