import { env } from "./config/env";
import { logger } from "./config/logger";
import { startNotificationConsumer } from "./queues/rabbitmq";
import { buildApp } from "./app";

const app = buildApp();

startNotificationConsumer().catch((error) => {
  logger.error({ error }, "RabbitMQ consumer bootstrap failed");
});

app.listen({ port: env.SERVICE_PORT, host: "0.0.0.0" })
  .then(() => logger.info(`${env.SERVICE_NAME} listening on ${env.SERVICE_PORT}`))
  .catch((error) => {
    logger.error({ error }, "Failed to start order-service");
    process.exit(1);
  });
