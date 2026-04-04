import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = z.object({
  SERVICE_NAME: z.string().default("order-service"),
  SERVICE_PORT: z.coerce.number().default(4005),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  RABBITMQ_URL: z.string().min(1)
}).parse(process.env);

