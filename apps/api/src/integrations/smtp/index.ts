import nodemailer, { type Transporter } from "nodemailer";
import type { SmtpProvider, SmtpSecurity } from "@postbird/shared";

export interface SmtpTransportConfig {
  provider: SmtpProvider;
  label: string;
  host: string;
  port: number;
  security: SmtpSecurity;
  username: string;
  isEnabled: boolean;
}

export function createTransport(
  config: SmtpTransportConfig,
  password: string,
): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.security === "TLS",
    requireTLS: config.security === "STARTTLS",
    auth: { user: config.username, pass: password },
  });
}

export async function verifyTransport(
  config: SmtpTransportConfig,
  password: string,
): Promise<boolean> {
  await createTransport(config, password).verify();
  return true;
}
