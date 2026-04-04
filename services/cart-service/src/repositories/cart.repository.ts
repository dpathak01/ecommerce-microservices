import { prisma } from "../utils/prisma";

export const cartRepository = {
  findByUserId: (userId: string) =>
    prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    }),
  upsertCart: (userId: string) =>
    prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: true }
    }),
  upsertItem: async (cartId: string, productId: string, quantity: number) => {
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } }
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { cartId_productId: { cartId, productId } },
        data: { quantity: existingItem.quantity + quantity }
      });
    }

    return prisma.cartItem.create({
      data: { cartId, productId, quantity }
    });
  },
  updateItem: (id: string, quantity: number) =>
    prisma.cartItem.update({ where: { id }, data: { quantity } }),
  deleteItem: (id: string) =>
    prisma.cartItem.delete({ where: { id } }),
  clearCart: async (cartId: string) => {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    return prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
  }
};

