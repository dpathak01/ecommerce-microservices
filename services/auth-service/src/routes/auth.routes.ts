import { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.post("/auth/refresh", authController.refresh);
  app.get("/auth/validate", authController.validate);
}

