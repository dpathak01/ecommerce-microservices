import { productRepository } from "../repositories/product.repository";
import { redis } from "../utils/redis";

const listKey = "products:list";
const productKey = (id: string) => `product:${id}`;

export const productService = {
  async list() {
    const cached = await redis.get(listKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const products = await productRepository.list();
    await redis.set(listKey, JSON.stringify(products), "EX", 180);
    return products;
  },
  async getOne(id: string) {
    const cached = await redis.get(productKey(id));
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    await redis.set(productKey(id), JSON.stringify(product), "EX", 300);
    return product;
  },
  async getBulk(ids: string[]) {
    return productRepository.findByIds(ids);
  },
  async create(input: { name: string; description: string; price: number; inventoryCount: number; category: string; imageUrl?: string }) {
    const product = await productRepository.create(input);
    await redis.del(listKey);
    return { ...product, price: Number(product.price) };
  },
  async update(id: string, input: { name?: string; description?: string; price?: number; inventoryCount?: number; category?: string; imageUrl?: string; isActive?: boolean }) {
    const product = await productRepository.update(id, input);
    await redis.del(listKey, productKey(id));
    return { ...product, price: Number(product.price) };
  }
};

