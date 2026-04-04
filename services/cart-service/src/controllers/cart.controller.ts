import { FastifyReply, FastifyRequest } from "fastify";
import { cartService } from "../services/cart.service";
import { addCartItemSchema, updateCartItemSchema } from "../validation/cart.validation";

export const cartController = {
  async getCart(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const cart = await cartService.getCart(request.params.userId);
    reply.send(cart);
  },
  async addItem(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const payload = addCartItemSchema.parse(request.body);
    const cart = await cartService.addItem(request.params.userId, payload.productId, payload.quantity);
    reply.send(cart);
  },
  async updateItem(request: FastifyRequest<{ Params: { userId: string; itemId: string } }>, reply: FastifyReply) {
    const payload = updateCartItemSchema.parse(request.body);
    const cart = await cartService.updateItem(request.params.userId, request.params.itemId, payload.quantity);
    reply.send(cart);
  },
  async removeItem(request: FastifyRequest<{ Params: { userId: string; itemId: string } }>, reply: FastifyReply) {
    const cart = await cartService.removeItem(request.params.userId, request.params.itemId);
    reply.send(cart);
  },
  async clearCart(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const cart = await cartService.clearCart(request.params.userId);
    reply.send(cart);
  }
};

