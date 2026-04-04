import Fastify from "fastify";
import { ZodError } from "zod";
import { logger } from "./config/logger";
import { userRoutes } from "./routes/user.routes";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true }));
  app.register(userRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: "Validation failed", issues: error.issues });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode = message === "User not found" ? 404 : 500;
    reply.code(statusCode).send({ message });
  });

  return app;
}
