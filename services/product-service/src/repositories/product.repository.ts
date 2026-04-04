import { prisma } from "../utils/prisma";

export const productRepository = {
  list: () => prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  findById: (id: string) => prisma.product.findUnique({ where: { id } }),
  findByIds: (ids: string[]) => prisma.product.findMany({ where: { id: { in: ids } } }),
  create: (data: { name: string; description: string; price: number; inventoryCount: number; category: string; imageUrl?: string }) =>
    prisma.product.create({
      data: {
        ...data,
        price: data.price
      }
    }),
  update: (id: string, data: { name?: string; description?: string; price?: number; inventoryCount?: number; category?: string; imageUrl?: string; isActive?: boolean }) =>
    prisma.product.update({ where: { id }, data })
};

