import type { RequestHandler } from "express";
import { AppError } from "../../utils/errors.js";
import {
  getTrackingStats,
  recordClick,
  recordOpen,
} from "./tracking.service.js";

export const getStats: RequestHandler = async (request, response, next) => {
  try {
    const data = await getTrackingStats(request.userId!);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const openPixel: RequestHandler = async (request, response, next) => {
  try {
    const gif = await recordOpen(
      String(request.params.trackingId),
      request.get("user-agent") ?? undefined,
      request.ip,
    );
    response
      .set({ "Content-Type": "image/gif", "Cache-Control": "no-store" })
      .send(gif);
  } catch (error) {
    next(error);
  }
};

export const clickRedirect: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const destination = await recordClick(
      String(request.params.trackingId),
      String(request.query.url ?? ""),
      request.get("user-agent") ?? undefined,
      request.ip,
    );
    response.redirect(destination);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_REDIRECT") {
      next(
        new AppError(
          "INVALID_REDIRECT",
          "Only HTTP(S) links can be tracked",
          400,
        ),
      );
      return;
    }
    if (error instanceof TypeError) {
      next(
        new AppError(
          "INVALID_REDIRECT",
          "Only HTTP(S) links can be tracked",
          400,
        ),
      );
      return;
    }
    next(error);
  }
};
