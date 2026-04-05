import Fastify from "fastify";
import { ZodError } from "zod";
import { logger } from "./config/logger";
import { authRoutes } from "./routes/auth.routes";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger, requestIdHeader: "x-request-id" });

  app.addHook("onRequest", async (request) => {
    const operationName = Array.isArray(request.headers["x-operation-name"])
      ? request.headers["x-operation-name"][0]
      : request.headers["x-operation-name"];
    const userId = Array.isArray(request.headers["x-user-id"])
      ? request.headers["x-user-id"][0]
      : request.headers["x-user-id"];
    const userRole = Array.isArray(request.headers["x-user-role"])
      ? request.headers["x-user-role"][0]
      : request.headers["x-user-role"];

    request.log.info(
      {
        requestId: request.id,
        operationName,
        userId,
        userRole,
        method: request.method,
        path: request.url
      },
      "Service request started"
    );
  });

  app.addHook("onResponse", async (request, reply) => {
    const operationName = Array.isArray(request.headers["x-operation-name"])
      ? request.headers["x-operation-name"][0]
      : request.headers["x-operation-name"];
    const userId = Array.isArray(request.headers["x-user-id"])
      ? request.headers["x-user-id"][0]
      : request.headers["x-user-id"];
    const userRole = Array.isArray(request.headers["x-user-role"])
      ? request.headers["x-user-role"][0]
      : request.headers["x-user-role"];

    request.log.info(
      {
        requestId: request.id,
        operationName,
        userId,
        userRole,
        method: request.method,
        path: request.url,
        statusCode: reply.statusCode,
        durationMs: Number(reply.elapsedTime.toFixed(2))
      },
      "Service request completed"
    );
  });

  app.get("/health", async () => ({ ok: true }));
  app.register(authRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: "Validation failed", issues: error.issues });
      return;
    }

    logger.error({ error }, "Unhandled error");
    reply.code(500).send({ message: error instanceof Error ? error.message : "Internal server error" });
  });

  return app;
}
