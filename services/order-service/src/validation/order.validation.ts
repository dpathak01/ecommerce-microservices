import { z } from "zod";

export const createOrderSchema = z.object({
  userId: z.string().uuid(),
  shippingAddress: z.string().min(10),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive()
  })).min(1)
});

