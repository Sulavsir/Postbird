import type { RequestHandler } from "express";
import { getDashboard } from "./dashboard.service.js";

export const getDashboardHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await getDashboard(request.userId!);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
