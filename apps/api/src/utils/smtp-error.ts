import { AppError } from "../utils/errors.js";

function smtpCode(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code ?? "");
  }
  return "";
}

export function toSmtpError(error: unknown): AppError {
  const code = smtpCode(error);
  const raw = error instanceof Error ? error.message : "SMTP operation failed";
  const lower = raw.toLowerCase();

  if (
    code === "ETIMEDOUT" ||
    code === "ECONNECTION" ||
    code === "ESOCKET" ||
    lower.includes("greeting never received") ||
    lower.includes("connect econnrefused") ||
    lower.includes("connect etimedout")
  ) {
    return new AppError(
      "SMTP_UNREACHABLE",
      "This server could not reach the mail host. Local send can work while production blocks SMTP ports (587/465). Do not host the API on Vercel serverless. Use a VPS, Railway, Render, or Fly, and allow outbound SMTP.",
      502,
    );
  }

  if (
    code === "EAUTH" ||
    lower.includes("invalid login") ||
    lower.includes("bad credentials") ||
    lower.includes("username and password not accepted")
  ) {
    return new AppError(
      "SMTP_AUTH_FAILED",
      "SMTP login failed. For Gmail use an App Password, not your normal password, and save the connection again on this environment.",
      502,
    );
  }

  return new AppError("SMTP_ERROR", raw.slice(0, 280), 502);
}
