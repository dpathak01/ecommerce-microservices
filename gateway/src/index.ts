import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import Redis from "ioredis";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { buildLoaders } from "./graphql/loaders";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schemas/typeDefs";
import { getAuthContext } from "./middleware/auth";

async function bootstrap() {
  const app = express();
  const redis = new Redis(env.REDIS_URL);
  const rateWindowMs = 60 * 1000;
  const rateLimitMax = 100;
  const requestCounts = new Map<string, { count: number; expiresAt: number }>();

  redis.on("error", (error) => logger.error({ error }, "Gateway Redis error"));

  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use((request, response, next) => {
    const key = request.ip || request.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || entry.expiresAt <= now) {
      requestCounts.set(key, { count: 1, expiresAt: now + rateWindowMs });
      response.setHeader("RateLimit-Limit", String(rateLimitMax));
      response.setHeader("RateLimit-Remaining", String(rateLimitMax - 1));
      next();
      return;
    }

    if (entry.count >= rateLimitMax) {
      response.setHeader("Retry-After", String(Math.ceil((entry.expiresAt - now) / 1000)));
      response.status(429).json({ message: "Too many requests" });
      return;
    }

    entry.count += 1;
    response.setHeader("RateLimit-Limit", String(rateLimitMax));
    response.setHeader("RateLimit-Remaining", String(Math.max(rateLimitMax - entry.count, 0)));
    next();
  });

  app.get("/health", async (_request, response) => {
    const redisStatus = redis.status;
    response.json({ ok: true, redisStatus });
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        auth: getAuthContext(req),
        loaders: buildLoaders()
      })
    })
  );

  app.listen(env.PORT, () => {
    logger.info(`Gateway listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start gateway");
  process.exit(1);
});
