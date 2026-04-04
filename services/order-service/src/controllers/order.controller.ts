import { FastifyReply, FastifyRequest } from "fastify";
import { orderService } from "../services/order.service";
import { createOrderSchema } from "../validation/order.validation";

export const orderController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = createOrderSchema.parse(request.body);
    const order = await orderService.create(payload);
    reply.code(201).send(order);
  },
  async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const order = await orderService.getOne(request.params.id);
    reply.send(order);
  },
  async getByUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const orders = await orderService.getByUserId(request.params.userId);
    reply.send(orders);
  }
};

