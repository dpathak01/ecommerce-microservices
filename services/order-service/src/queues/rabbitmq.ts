import amqp, { ChannelModel, Channel } from "amqplib";
import { env } from "../config/env";
import { logger } from "../config/logger";

const exchangeName = "commerce.events";
const queueName = "email.notifications";
const retryDelayMs = 5000;

let connection: ChannelModel | undefined;
let channel: Channel | undefined;

function resetRabbitConnection() {
  connection = undefined;
  channel = undefined;
}

export async function getRabbitChannel() {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(env.RABBITMQ_URL);
  connection.on("close", resetRabbitConnection);
  connection.on("error", resetRabbitConnection);
  channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "order.created");
  return channel;
}

export async function publishOrderCreated(payload: unknown) {
  const activeChannel = await getRabbitChannel();
  activeChannel.publish(exchangeName, "order.created", Buffer.from(JSON.stringify(payload)), {
    persistent: true
  });
}

export async function startNotificationConsumer() {
  while (true) {
    try {
      const activeChannel = await getRabbitChannel();
      await activeChannel.consume(queueName, (message) => {
        if (!message) {
          return;
        }

        logger.info({ payload: JSON.parse(message.content.toString()) }, "Sending order email notification");
        activeChannel.ack(message);
      });
      return;
    } catch (error) {
      resetRabbitConnection();
      logger.warn({ error, retryDelayMs }, "RabbitMQ not ready, retrying consumer bootstrap");
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}
