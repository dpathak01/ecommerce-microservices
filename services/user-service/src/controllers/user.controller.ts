import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "../services/user.service";
import { createUserSchema, updateUserSchema } from "../validation/user.validation";
import { z } from "zod";

const bulkLookupSchema = z.object({
  ids: z.array(z.string().uuid()).min(1)
});

export const userController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = createUserSchema.parse(request.body);
    const result = await userService.create(payload);
    reply.code(201).send(result);
  },
  async update(request: FastifyRequest<{ Params: { authUserId: string } }>, reply: FastifyReply) {
    const payload = updateUserSchema.parse(request.body);
    const result = await userService.update(request.params.authUserId, payload);
    reply.send(result);
  },
  async getOne(request: FastifyRequest<{ Params: { authUserId: string } }>, reply: FastifyReply) {
    const result = await userService.getByAuthUserId(request.params.authUserId);
    reply.send(result);
  },
  async getBulk(request: FastifyRequest, reply: FastifyReply) {
    const payload = bulkLookupSchema.parse(request.body);
    const result = await userService.getBulk(payload.ids);
    reply.send(result);
  }
};
