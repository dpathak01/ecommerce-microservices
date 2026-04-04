import { FastifyInstance } from "fastify";
import { cartController } from "../controllers/cart.controller";

export async function cartRoutes(app: FastifyInstance) {
  app.get("/cart/:userId", cartController.getCart);
  app.post("/cart/:userId/items", cartController.addItem);
  app.put("/cart/:userId/items/:itemId", cartController.updateItem);
  app.delete("/cart/:userId/items/:itemId", cartController.removeItem);
  app.delete("/cart/:userId/clear", cartController.clearCart);
}

