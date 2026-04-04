import { publishOrderCreated } from "../queues/rabbitmq";
import { orderRepository } from "../repositories/order.repository";
import { redis } from "../utils/redis";

const userOrdersKey = (userId: string) => `orders:${userId}`;
type DecimalLike = number | { toString(): string };
type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: DecimalLike;
  createdAt: Date;
  updatedAt: Date;
};
type OrderRecord = {
  id: string;
  userId: string;
  status: string;
  shippingAddress: string;
  totalAmount: DecimalLike;
  items: OrderItemRecord[];
  createdAt: Date;
  updatedAt: Date;
};

function normalizeOrder(order: OrderRecord) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item: OrderItemRecord) => ({
      ...item,
      unitPrice: Number(item.unitPrice)
    }))
  };
}

export const orderService = {
  async create(input: { userId: string; shippingAddress: string; items: Array<{ productId: string; quantity: number; unitPrice: number }> }) {
    const totalAmount = input.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const order = await orderRepository.create({
      ...input,
      totalAmount
    }) as unknown as OrderRecord;

    await redis.del(userOrdersKey(input.userId));
    await publishOrderCreated({
      orderId: order.id,
      userId: order.userId,
      totalAmount,
      shippingAddress: order.shippingAddress
    });

    return normalizeOrder(order);
  },
  async getOne(id: string) {
    const order = await orderRepository.findById(id) as unknown as OrderRecord | null;
    if (!order) {
      throw new Error("Order not found");
    }

    return normalizeOrder(order);
  },
  async getByUserId(userId: string) {
    const cached = await redis.get(userOrdersKey(userId));
    if (cached) {
      return JSON.parse(cached);
    }

    const orders = await orderRepository.findByUserId(userId) as unknown as OrderRecord[];
    const normalized = orders.map((order: OrderRecord) => normalizeOrder(order));
    await redis.set(userOrdersKey(userId), JSON.stringify(normalized), "EX", 180);
    return normalized;
  }
};
