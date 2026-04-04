import { FastifyInstance } from "fastify";
import { userController } from "../controllers/user.controller";

export async function userRoutes(app: FastifyInstance) {
  app.post("/users", userController.create);
  app.post("/users/bulk", userController.getBulk);
  app.get("/users/:authUserId", userController.getOne);
  app.put("/users/:authUserId", userController.update);
}
