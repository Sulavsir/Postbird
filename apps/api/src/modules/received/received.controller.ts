import type { RequestHandler } from "express";
import type { ImapSyncInput } from "@postbird/shared";
import { listReceived, syncReceived } from "./received.service.js";

export const listReceivedHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await listReceived(request.userId!);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const syncReceivedHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await syncReceived(
      request.userId!,
      request.body as ImapSyncInput,
    );
    response.json({
      success: true,
      data,
      message: "Inbox synchronized",
    });
  } catch (error) {
    next(error);
  }
};
