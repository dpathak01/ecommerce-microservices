import gql from "graphql-tag";

export const typeDefs = gql`
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    userId: ID!
    email: String!
  }

  type User {
    id: ID!
    authUserId: String!
    email: String!
    name: String!
    phone: String
    address: String
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    inventoryCount: Int!
    category: String!
    imageUrl: String
    isActive: Boolean!
  }

  type CartItem {
    id: ID!
    productId: String!
    quantity: Int!
    product: Product
  }

  type Cart {
    id: ID!
    userId: String!
    items: [CartItem!]!
  }

  type OrderItem {
    id: ID!
    productId: String!
    quantity: Int!
    unitPrice: Float!
    product: Product
  }

  type Order {
    id: ID!
    userId: String!
    status: String!
    totalAmount: Float!
    items: [OrderItem!]!
    user: User
    createdAt: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input AddCartItemInput {
    productId: String!
    quantity: Int!
  }

  input CheckoutInput {
    shippingAddress: String!
  }

  type Query {
    me: User
    products: [Product!]!
    product(id: ID!): Product
    cart: Cart
    orders: [Order!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!
    addCartItem(input: AddCartItemInput!): Cart!
    checkout(input: CheckoutInput!): Order!
  }
`;

