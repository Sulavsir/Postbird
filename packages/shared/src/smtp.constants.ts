export const SMTP_PROVIDERS = [
  "GMAIL",
  "YAHOO",
  "MICROSOFT",
  "CUSTOM",
] as const;
export const SMTP_SECURITY = ["TLS", "STARTTLS", "NONE"] as const;

export type SmtpProvider = (typeof SMTP_PROVIDERS)[number];
export type SmtpSecurity = (typeof SMTP_SECURITY)[number];

export const SMTP_PROVIDER_PRESETS: Record<
  SmtpProvider,
  {
    label: string;
    host: string;
    port: number;
    security: SmtpSecurity;
    imapHost: string;
    imapPort: number;
    help: string;
  }
> = {
  GMAIL: {
    label: "Google / Gmail",
    host: "smtp.gmail.com",
    port: 587,
    security: "STARTTLS",
    imapHost: "imap.gmail.com",
    imapPort: 993,
    help: "Host is smtp.gmail.com. Port 587 uses STARTTLS (typical App Password setup). Port 465 also works as TLS if you switch to Custom SMTP.",
  },
  YAHOO: {
    label: "Yahoo Mail",
    host: "smtp.mail.yahoo.com",
    port: 465,
    security: "TLS",
    imapHost: "imap.mail.yahoo.com",
    imapPort: 993,
    help: "Generate a Yahoo App Password from account security settings.",
  },
  MICROSOFT: {
    label: "Microsoft 365",
    host: "smtp.office365.com",
    port: 587,
    security: "STARTTLS",
    imapHost: "outlook.office365.com",
    imapPort: 993,
    help: "Use the mailbox address and an app password or SMTP AUTH-enabled account.",
  },
  CUSTOM: {
    label: "Custom SMTP",
    host: "",
    port: 587,
    security: "STARTTLS",
    imapHost: "",
    imapPort: 993,
    help: "Provide the host, port, and TLS mode from your mail provider.",
  },
};

export function resolveSmtpEndpoint(provider: SmtpProvider, custom?: {
  host?: string;
  port?: number;
  security?: SmtpSecurity;
}) {
  if (provider === "CUSTOM") {
    return {
      host: custom?.host?.trim() ?? "",
      port: custom?.port ?? 587,
      security: custom?.security ?? "STARTTLS",
    };
  }
  const preset = SMTP_PROVIDER_PRESETS[provider];
  return {
    host: preset.host,
    port: preset.port,
    security: preset.security,
  };
}
