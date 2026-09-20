export { emailService } from "./email.service";
export type { EmailRecord, SendEmailInput, SentEmailResult } from "./email.service";
export {
  EMAILS_QUERY_KEY,
  useDeleteEmail,
  useEmail,
  useEmails,
  useSendEmail,
} from "./use-emails";
