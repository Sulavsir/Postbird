import type { RequestHandler } from "express";
import type { SmtpConfigurationInput, SmtpUpdateInput } from "@postbird/shared";
import {
  createConfiguration,
  deleteConfiguration,
  listConfigurations,
  testConfiguration,
  updateConfiguration,
} from "./smtp.service.js";

export const listSmtp: RequestHandler = async (request, response, next) => {
  try {
    const data = await listConfigurations(request.userId!);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createSmtp: RequestHandler = async (request, response, next) => {
  try {
    const data = await createConfiguration(
      request.userId!,
      request.body as SmtpConfigurationInput,
    );
    response.status(201).json({
      success: true,
      data,
      message: "SMTP configuration saved",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSmtp: RequestHandler = async (request, response, next) => {
  try {
    const data = await updateConfiguration(
      request.userId!,
      String(request.params.id),
      request.body as SmtpUpdateInput,
    );
    response.json({
      success: true,
      data,
      message: "SMTP configuration updated",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSmtp: RequestHandler = async (request, response, next) => {
  try {
    const data = await deleteConfiguration(
      request.userId!,
      String(request.params.id),
    );
    response.json({
      success: true,
      data,
      message: data.deleted
        ? "SMTP configuration deleted"
        : "Configuration is in use and was disabled instead",
    });
  } catch (error) {
    next(error);
  }
};

export const testSmtp: RequestHandler = async (request, response, next) => {
  try {
    const data = await testConfiguration(
      request.userId!,
      String(request.params.id),
    );
    response.json({
      success: true,
      data,
      message: "SMTP connection verified",
    });
  } catch (error) {
    next(error);
  }
};
