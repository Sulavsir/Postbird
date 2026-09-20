import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate: RequestHandler = (request, _response, next) => {
  const token = request.header("authorization")?.replace("Bearer ", "");
  if (!token) return next(new UnauthorizedError());
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload !== "object" || !payload.sub)
      return next(new UnauthorizedError());
    request.userId = String(payload.sub);
    next();
  } catch {
    next(new UnauthorizedError());
  }
};
