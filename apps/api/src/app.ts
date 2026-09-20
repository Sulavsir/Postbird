import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { smtpRouter } from "./modules/smtp/smtp.routes.js";
import { emailRouter } from "./modules/email/email.routes.js";
import { trackingRouter } from "./modules/tracking/tracking.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { attachmentsRouter } from "./modules/attachments/attachments.routes.js";
import { receivedRouter } from "./modules/received/received.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { apiRateLimit } from "./middlewares/rate-limit.middleware.js";

export const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
const allowedOrigins = new Set([
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(apiRateLimit);
app.get("/api/health", (_request, response) =>
  response.json({ success: true, data: { status: "ok" } }),
);
app.use("/api/auth", authRouter);
app.use("/api/smtp", smtpRouter);
app.use("/api/emails", emailRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/attachments", attachmentsRouter);
app.use("/api/received", receivedRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(errorMiddleware);
