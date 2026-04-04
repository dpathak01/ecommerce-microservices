import { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "../services/auth.service";
import { loginSchema, refreshSchema, registerSchema } from "../validation/auth.validation";

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const payload = registerSchema.parse(request.body);
    const result = await authService.register(payload);
    reply.code(201).send(result);
  },
  async login(request: FastifyRequest, reply: FastifyReply) {
    const payload = loginSchema.parse(request.body);
    const result = await authService.login(payload);
    reply.send(result);
  },
  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const payload = refreshSchema.parse(request.body);
    const result = await authService.refresh(payload.refreshToken);
    reply.send(result);
  },
  async validate(request: FastifyRequest, reply: FastifyReply) {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      reply.code(401).send({ message: "Missing token" });
      return;
    }

    const token = authorization.replace("Bearer ", "");
    const result = await authService.validate(token);
    reply.send(result);
  }
};

