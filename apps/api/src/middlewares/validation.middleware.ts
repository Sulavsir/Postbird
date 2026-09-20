import type { RequestHandler } from "express";
import type { z } from "zod";
import { AppError } from "../utils/errors.js";

export function validate(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(
        new AppError(
          "VALIDATION_ERROR",
          result.error.issues.map((issue) => issue.message).join(", "),
          422,
        ),
      );
      return;
    }
    request.body = result.data;
    next();
  };
}
