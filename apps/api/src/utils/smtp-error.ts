import { AppError } from "../utils/errors.js";

export function toSmtpError(error: unknown): AppError {
  const message =
    error instanceof Error ? error.message : "SMTP operation failed";
  return new AppError("SMTP_ERROR", message.slice(0, 280), 502);
}
