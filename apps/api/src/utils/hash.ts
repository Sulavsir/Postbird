import crypto from "node:crypto";
import { env } from "../config/env.js";

export function hashClientIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  return crypto
    .createHash("sha256")
    .update(`${ip}:${env.ENCRYPTION_KEY}`)
    .digest("hex")
    .slice(0, 40);
}
