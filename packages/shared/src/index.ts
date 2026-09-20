export * from "./api.constants.js";
export * from "./smtp.constants.js";
export * from "./schemas.js";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginatedMeta;
}
export interface ApiFailure {
  success: false;
  error: { code: string; message: string };
}
export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
