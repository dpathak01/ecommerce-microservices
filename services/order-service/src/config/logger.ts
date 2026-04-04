import pino from "pino";
import { env } from "./env";

export const logger = pino({ name: env.SERVICE_NAME, level: process.env.LOG_LEVEL ?? "info" });

