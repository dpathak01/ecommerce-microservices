import DataLoader from "dataloader";
import { env } from "../../config/env";
import { type DownstreamRequestContext, http } from "../../utils/http";

export type UserProfile = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  inventoryCount: number;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
};

export function buildLoaders(requestContext: DownstreamRequestContext) {
  return {
    userLoader: new DataLoader<string, UserProfile | null>(async (ids) => {
      const users = await http<UserProfile[]>(`${env.USER_SERVICE_URL}/users/bulk`, {
        method: "POST",
        body: JSON.stringify({ ids })
      }, requestContext);
      const mapped = new Map(users.map((user) => [user.authUserId, user]));
      return ids.map((id) => mapped.get(id) ?? null);
    }),
    productLoader: new DataLoader<string, Product | null>(async (ids) => {
      const products = await http<Product[]>(`${env.PRODUCT_SERVICE_URL}/products/bulk`, {
        method: "POST",
        body: JSON.stringify({ ids })
      }, requestContext);
      const mapped = new Map(products.map((product) => [product.id, product]));
      return ids.map((id) => mapped.get(id) ?? null);
    })
  };
}

export type GatewayLoaders = ReturnType<typeof buildLoaders>;
