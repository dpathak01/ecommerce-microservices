import { z } from "zod";

export const createUserSchema = z.object({
  authUserId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

