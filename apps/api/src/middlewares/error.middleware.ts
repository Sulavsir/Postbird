import type { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/errors.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
    return;
  }
  if (error instanceof Error && error.message.startsWith("FILE_TYPE_NOT_ALLOWED")) {
    response.status(422).json({
      success: false,
      error: {
        code: "FILE_INVALID",
        message: error.message.replace("FILE_TYPE_NOT_ALLOWED: ", ""),
      },
    });
    return;
  }
  if (error instanceof MulterError) {
    response.status(422).json({
      success: false,
      error: {
        code: "FILE_INVALID",
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File exceeds the 25MB upload limit"
            : "The uploaded file is not valid",
      },
    });
    return;
  }
  console.error(
    error instanceof Error ? error.message : "Unexpected server error",
  );
  response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
