import type { RequestHandler } from "express";
import type { SendEmailInput } from "@postbird/shared";
import {
  deleteEmail,
  getEmail,
  listEmails,
  sendEmail as dispatchEmail,
} from "./email.service.js";

export const listEmailsHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const page = Math.max(Number(request.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
    const result = await listEmails(request.userId!, page, limit);
    response.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getEmailHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await getEmail(request.userId!, String(request.params.id));
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteEmailHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await deleteEmail(request.userId!, String(request.params.id));
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const sendEmailHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const data = await dispatchEmail(
      request.userId!,
      request.body as SendEmailInput,
    );
    response.status(201).json({
      success: true,
      data,
      message: "Email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
