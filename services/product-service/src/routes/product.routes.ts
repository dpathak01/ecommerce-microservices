import { FastifyInstance } from "fastify";
import { productController } from "../controllers/product.controller";

export async function productRoutes(app: FastifyInstance) {
  app.get("/products", productController.list);
  app.post("/products/bulk", productController.getBulk);
  app.get("/products/:id", productController.getOne);
  app.post("/products", productController.create);
  app.put("/products/:id", productController.update);
}

