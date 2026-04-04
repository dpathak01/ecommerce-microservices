import { FastifyInstance } from "fastify";
import { orderController } from "../controllers/order.controller";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/orders", orderController.create);
  app.get("/orders/:id", orderController.getOne);
  app.get("/orders/user/:userId", orderController.getByUser);
}

