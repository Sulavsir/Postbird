import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/errors.js";

function issueToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: "7d" });
}

export function publicUser(user: {
  id: string;
  email: string;
  displayName: string;
}) {
  return { id: user.id, email: user.email, displayName: user.displayName };
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AppError(
      "EMAIL_IN_USE",
      "An account with this email already exists",
      409,
    );
  }
  const user = await prisma.user.create({
    data: {
      email: input.email,
      displayName: input.displayName,
      passwordHash: await bcrypt.hash(input.password, 12),
    },
    select: { id: true, email: true, displayName: true },
  });
  return { user, token: issueToken(user.id) };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "Email or password is incorrect",
      401,
    );
  }
  return { user: publicUser(user), token: issueToken(user.id) };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true },
  });
  if (!user) throw new AppError("USER_NOT_FOUND", "User was not found", 404);
  return user;
}
