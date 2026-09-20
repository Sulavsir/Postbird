import { prisma } from "../../lib/prisma.js";

export async function getDashboard(userId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    user,
    sentThisMonth,
    totalSent,
    failed,
    opened,
    clicked,
    smtpConfigurations,
    sentEmails,
    receivedEmails,
    attachments,
  ] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true },
    }),
    prisma.email.count({
      where: { userId, status: "SENT", sentAt: { gte: monthStart } },
    }),
    prisma.email.count({ where: { userId, status: "SENT" } }),
    prisma.email.count({ where: { userId, status: "FAILED" } }),
    prisma.email.count({
      where: { userId, status: "SENT", openCount: { gt: 0 } },
    }),
    prisma.trackingEvent.count({
      where: { email: { userId }, type: "CLICK" },
    }),
    prisma.smtpConfiguration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        provider: true,
        label: true,
        host: true,
        port: true,
        security: true,
        username: true,
        isEnabled: true,
        lastVerifiedAt: true,
      },
    }),
    prisma.email.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { recipients: { where: { type: "TO" }, take: 1 } },
    }),
    prisma.receivedEmail.findMany({
      where: { userId },
      orderBy: { receivedAt: "desc" },
      take: 10,
    }),
    prisma.attachment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        emailId: true,
      },
    }),
  ]);

  return {
    user,
    stats: {
      sentThisMonth,
      totalSent,
      opened,
      clicked,
      openRate: totalSent ? opened / totalSent : 0,
      deliveryRate: totalSent + failed ? totalSent / (totalSent + failed) : 0,
    },
    smtpConfigurations,
    sentEmails,
    receivedEmails,
    attachments,
  };
}
