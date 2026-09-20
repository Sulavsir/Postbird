import { prisma } from "../../lib/prisma.js";
import { hashClientIp } from "../../utils/hash.js";

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
  "base64",
);

export async function getTrackingStats(userId: string) {
  const [totalSent, opened, clicked, failed] = await Promise.all([
    prisma.email.count({ where: { userId, status: "SENT" } }),
    prisma.email.count({ where: { userId, openCount: { gt: 0 } } }),
    prisma.trackingEvent.count({
      where: { email: { userId }, type: "CLICK" },
    }),
    prisma.email.count({ where: { userId, status: "FAILED" } }),
  ]);
  return {
    totalSent,
    opened,
    clicked,
    failed,
    openRate: totalSent ? opened / totalSent : 0,
  };
}

export async function recordOpen(
  trackingId: string,
  userAgent: string | undefined,
  ip: string | undefined,
) {
  const email = await prisma.email.findUnique({ where: { trackingId } });
  if (email?.trackOpens) {
    const now = new Date();
    await prisma.$transaction([
      prisma.trackingEvent.create({
        data: {
          emailId: email.id,
          type: "OPEN",
          userAgent: userAgent?.slice(0, 500),
          ipHash: hashClientIp(ip),
        },
      }),
      prisma.email.update({
        where: { id: email.id },
        data: {
          openCount: { increment: 1 },
          firstOpenedAt: email.firstOpenedAt ?? now,
          lastOpenedAt: now,
        },
      }),
    ]);
  }
  return TRANSPARENT_GIF;
}

export async function recordClick(
  trackingId: string,
  rawUrl: string,
  userAgent: string | undefined,
  ip: string | undefined,
) {
  const destination = new URL(rawUrl);
  if (!["http:", "https:"].includes(destination.protocol)) {
    throw new Error("INVALID_REDIRECT");
  }
  const email = await prisma.email.findUnique({ where: { trackingId } });
  if (email?.trackClicks) {
    await prisma.trackingEvent.create({
      data: {
        emailId: email.id,
        type: "CLICK",
        url: destination.toString(),
        userAgent: userAgent?.slice(0, 500),
        ipHash: hashClientIp(ip),
      },
    });
  }
  return destination.toString();
}
