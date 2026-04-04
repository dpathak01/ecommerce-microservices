import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  inventoryCount: z.number().int().nonnegative(),
  category: z.string().min(2),
  imageUrl: z.string().url().optional()
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional()
});

export const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1)
});

