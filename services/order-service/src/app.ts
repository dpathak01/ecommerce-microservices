import Fastify from "fastify";
import { ZodError } from "zod";
import { logger } from "./config/logger";
import { orderRoutes } from "./routes/order.routes";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true }));
  app.register(orderRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: "Validation failed", issues: error.issues });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode = message === "Order not found" ? 404 : 500;
    reply.code(statusCode).send({ message });
  });

  return app;
}
