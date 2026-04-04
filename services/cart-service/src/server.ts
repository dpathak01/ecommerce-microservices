import { env } from "./config/env";
import { logger } from "./config/logger";
import { buildApp } from "./app";

const app = buildApp();

app.listen({ port: env.SERVICE_PORT, host: "0.0.0.0" })
  .then(() => logger.info(`${env.SERVICE_NAME} listening on ${env.SERVICE_PORT}`))
  .catch((error) => {
    logger.error({ error }, "Failed to start cart-service");
    process.exit(1);
  });
