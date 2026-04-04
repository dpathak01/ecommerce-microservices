import Fastify from "fastify";
import { ZodError } from "zod";
import { logger } from "./config/logger";
import { cartRoutes } from "./routes/cart.routes";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true }));
  app.register(cartRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: "Validation failed", issues: error.issues });
      return;
    }

    reply.code(500).send({ message: error instanceof Error ? error.message : "Internal server error" });
  });

  return app;
}
