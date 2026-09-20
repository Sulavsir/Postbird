import type { RequestHandler } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.service.js";

export const register: RequestHandler = async (request, response, next) => {
  try {
    const data = await registerUser(request.body);
    response.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (request, response, next) => {
  try {
    const data = await loginUser(request.body);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (request, response, next) => {
  try {
    const data = await getCurrentUser(request.userId!);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
