import { cartRepository } from "../repositories/cart.repository";
import { redis } from "../utils/redis";

const cartKey = (userId: string) => `cart:${userId}`;

export const cartService = {
  async getCart(userId: string) {
    const cached = await redis.get(cartKey(userId));
    if (cached) {
      return JSON.parse(cached);
    }

    const cart = await cartRepository.upsertCart(userId);
    await redis.set(cartKey(userId), JSON.stringify(cart), "EX", 180);
    return cart;
  },
  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await cartRepository.upsertCart(userId);
    await cartRepository.upsertItem(cart.id, productId, quantity);
    await redis.del(cartKey(userId));
    return this.getCart(userId);
  },
  async updateItem(userId: string, itemId: string, quantity: number) {
    await cartRepository.updateItem(itemId, quantity);
    await redis.del(cartKey(userId));
    return this.getCart(userId);
  },
  async removeItem(userId: string, itemId: string) {
    await cartRepository.deleteItem(itemId);
    await redis.del(cartKey(userId));
    return this.getCart(userId);
  },
  async clearCart(userId: string) {
    const cart = await cartRepository.upsertCart(userId);
    await cartRepository.clearCart(cart.id);
    await redis.del(cartKey(userId));
    return this.getCart(userId);
  }
};

