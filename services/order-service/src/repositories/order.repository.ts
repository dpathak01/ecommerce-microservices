import { prisma } from "../utils/prisma";

export const orderRepository = {
  create: (data: {
    userId: string;
    shippingAddress: string;
    totalAmount: number;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  }) =>
    prisma.order.create({
      data: {
        userId: data.userId,
        shippingAddress: data.shippingAddress,
        totalAmount: data.totalAmount,
        items: {
          create: data.items
        }
      },
      include: { items: true }
    }),
  findById: (id: string) =>
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
  findByUserId: (userId: string) =>
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    })
};

