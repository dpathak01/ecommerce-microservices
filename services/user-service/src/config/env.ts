import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = z.object({
  SERVICE_NAME: z.string().default("user-service"),
  SERVICE_PORT: z.coerce.number().default(4002),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url()
}).parse(process.env);

