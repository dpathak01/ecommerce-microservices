import { env } from "../../config/env";
import { requireAuth } from "../../middleware/auth";
import { http } from "../../utils/http";
import { GatewayLoaders } from "../loaders";

type Context = {
  auth: {
    userId?: string;
    email?: string;
    role?: string;
    token?: string;
  };
  loaders: GatewayLoaders;
};

type CartResponse = {
  id: string;
  userId: string;
  items: Array<{ id: string; productId: string; quantity: number }>;
};

type OrderResponse = {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  items: Array<{ id: string; productId: string; quantity: number; unitPrice: number }>;
  createdAt: string;
};

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      requireAuth(context.auth);
      return context.loaders.userLoader.load(context.auth.userId);
    },
    products: async () => http(`${env.PRODUCT_SERVICE_URL}/products`),
    product: async (_parent: unknown, args: { id: string }, context: Context) =>
      context.loaders.productLoader.load(args.id),
    cart: async (_parent: unknown, _args: unknown, context: Context) => {
      requireAuth(context.auth);
      return http<CartResponse>(`${env.CART_SERVICE_URL}/cart/${context.auth.userId}`);
    },
    orders: async (_parent: unknown, _args: unknown, context: Context) => {
      requireAuth(context.auth);
      return http<OrderResponse[]>(`${env.ORDER_SERVICE_URL}/orders/user/${context.auth.userId}`);
    }
  },
  Mutation: {
    register: async (_parent: unknown, args: { input: { email: string; password: string; name: string } }) => {
      const authPayload = await http<{ accessToken: string; refreshToken: string; userId: string; email: string }>(
        `${env.AUTH_SERVICE_URL}/auth/register`,
        {
          method: "POST",
          body: JSON.stringify(args.input)
        }
      );

      await http(`${env.USER_SERVICE_URL}/users`, {
        method: "POST",
        body: JSON.stringify({
          authUserId: authPayload.userId,
          email: args.input.email,
          name: args.input.name
        })
      });

      return authPayload;
    },
    login: async (_parent: unknown, args: { email: string; password: string }) =>
      http(`${env.AUTH_SERVICE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(args)
      }),
    refreshToken: async (_parent: unknown, args: { refreshToken: string }) =>
      http(`${env.AUTH_SERVICE_URL}/auth/refresh`, {
        method: "POST",
        body: JSON.stringify(args)
      }),
    addCartItem: async (_parent: unknown, args: { input: { productId: string; quantity: number } }, context: Context) => {
      requireAuth(context.auth);
      return http<CartResponse>(`${env.CART_SERVICE_URL}/cart/${context.auth.userId}/items`, {
        method: "POST",
        body: JSON.stringify(args.input)
      });
    },
    checkout: async (_parent: unknown, args: { input: { shippingAddress: string } }, context: Context) => {
      requireAuth(context.auth);
      const cart = await http<CartResponse>(`${env.CART_SERVICE_URL}/cart/${context.auth.userId}`);
      const products = await Promise.all(
        cart.items.map((item) => context.loaders.productLoader.load(item.productId))
      );

      const order = await http<OrderResponse>(`${env.ORDER_SERVICE_URL}/orders`, {
        method: "POST",
        body: JSON.stringify({
          userId: context.auth.userId,
          shippingAddress: args.input.shippingAddress,
          items: cart.items.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: products[index]?.price ?? 0
          }))
        })
      });

      await http(`${env.CART_SERVICE_URL}/cart/${context.auth.userId}/clear`, {
        method: "DELETE"
      });

      return order;
    }
  },
  CartItem: {
    product: (parent: { productId: string }, _args: unknown, context: Context) =>
      context.loaders.productLoader.load(parent.productId)
  },
  Order: {
    user: (parent: { userId: string }, _args: unknown, context: Context) =>
      context.loaders.userLoader.load(parent.userId)
  },
  OrderItem: {
    product: (parent: { productId: string }, _args: unknown, context: Context) =>
      context.loaders.productLoader.load(parent.productId)
  }
};

