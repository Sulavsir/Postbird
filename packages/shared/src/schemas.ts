import { z } from "zod";
import {
  SMTP_PROVIDERS,
  SMTP_SECURITY,
  resolveSmtpEndpoint,
} from "./smtp.constants.js";

export const EMAIL_STATUS = ["DRAFT", "QUEUED", "SENT", "FAILED"] as const;
export const TRACKING_EVENT_TYPES = ["OPEN", "CLICK"] as const;
export const RECIPIENT_TYPES = ["TO", "CC", "BCC"] as const;

export const smtpConfigurationSchema = z
  .object({
    provider: z.enum(SMTP_PROVIDERS),
    label: z.string().trim().min(1).max(80),
    host: z.string().trim().max(255).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    security: z.enum(SMTP_SECURITY).optional(),
    username: z.string().trim().min(1).max(255),
    password: z.string().min(1).max(512),
    isEnabled: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    if (value.provider === "CUSTOM" && !value.host?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["host"],
        message: "Host is required for custom SMTP",
      });
    }
  })
  .transform((value) => {
    const endpoint = resolveSmtpEndpoint(value.provider, value);
    return {
      ...value,
      host: endpoint.host,
      port: endpoint.port,
      security: endpoint.security,
    };
  });

export const smtpUpdateSchema = z
  .object({
    provider: z.enum(SMTP_PROVIDERS).optional(),
    label: z.string().trim().min(1).max(80).optional(),
    host: z.string().trim().max(255).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    security: z.enum(SMTP_SECURITY).optional(),
    username: z.string().trim().min(1).max(255).optional(),
    password: z.string().min(1).max(512).optional(),
    isEnabled: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.provider === "CUSTOM" && value.host !== undefined && !value.host.trim()) {
      context.addIssue({
        code: "custom",
        path: ["host"],
        message: "Host is required for custom SMTP",
      });
    }
  });

export const entityIdSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Invalid id",
  );

export const sendEmailSchema = z.object({
  smtpConfigurationId: entityIdSchema,
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).default([]),
  bcc: z.array(z.string().email()).default([]),
  subject: z.string().trim().min(1).max(255),
  body: z.string().min(1),
  attachmentIds: z.array(entityIdSchema).default([]),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

export const imapSyncSchema = z.object({
  host: z.string().trim().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(512),
});

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const registrationSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(1).max(80),
});

export type SmtpConfigurationInput = z.infer<typeof smtpConfigurationSchema>;
export type SmtpUpdateInput = z.infer<typeof smtpUpdateSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type ImapSyncInput = z.infer<typeof imapSyncSchema>;
export type EmailStatus = (typeof EMAIL_STATUS)[number];
export type TrackingEventType = (typeof TRACKING_EVENT_TYPES)[number];
