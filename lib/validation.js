import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1).max(254).email(),
  password: z.string().min(1).max(200),
});

export const addUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().min(1).max(254).email(),
  role: z.enum(["ADMIN", "NORMAL"]),
  password: z.string().min(8).max(200),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().min(1).max(254).email().optional(),
  role: z.enum(["ADMIN", "NORMAL"]).optional(),
  password: z.string().min(8).max(200).optional(),
});

export const trackCodeSchema = z.object({
  input: z.string().trim().min(1).max(500),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
