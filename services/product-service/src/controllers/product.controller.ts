import { FastifyReply, FastifyRequest } from "fastify";
import { productService } from "../services/product.service";
import { bulkSchema, createProductSchema, updateProductSchema } from "../validation/product.validation";

type DecimalLike = number | { toString(): string };

type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: DecimalLike;
  inventoryCount: number;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const productController = {
  async list(_request: FastifyRequest, reply: FastifyReply) {
    const products = await productService.list() as ProductRecord[];
    reply.send(products.map((product: ProductRecord) => ({ ...product, price: Number(product.price) })));
  },
  async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const product = await productService.getOne(request.params.id);
    reply.send({ ...product, price: Number(product.price) });
  },
  async getBulk(request: FastifyRequest, reply: FastifyReply) {
    const payload = bulkSchema.parse(request.body);
    const products = await productService.getBulk(payload.ids) as ProductRecord[];
    reply.send(products.map((product: ProductRecord) => ({ ...product, price: Number(product.price) })));
  },
  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = createProductSchema.parse(request.body);
    const product = await productService.create(payload);
    reply.code(201).send(product);
  },
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const payload = updateProductSchema.parse(request.body);
    const product = await productService.update(request.params.id, payload);
    reply.send(product);
  }
};
