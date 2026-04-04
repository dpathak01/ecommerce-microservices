# GraphQL Testing Guide

This document lists all GraphQL queries and mutations currently exposed by the gateway at:

```text
http://localhost:4000/graphql
```

## Notes

- Operations like `me`, `cart`, `orders`, `addCartItem`, and `checkout` require authentication.
- For authenticated requests, send this header in Apollo Sandbox or your client:

```http
Authorization: Bearer <accessToken returned by login or register>
```

- `createProduct` and `updateProduct` are not available in GraphQL yet.
- Product creation currently exists only in the internal product REST service, not in the gateway GraphQL schema.
- The current seeded product IDs in this environment are:
  - `86fe47e5-36c8-4e9b-9bf7-931eff09fb16` for `Noise Cancelling Headphones`
  - `c586871e-7ff0-4eb9-a962-7faa63c76fd2` for `Running Shoes`
  - `f8fd642f-d3df-4f5c-a71a-999d6ff6d90d` for `Coffee Maker`

## Suggested Test Flow

1. Run `register`
2. Run `login`
3. Copy `accessToken`
4. Set `Authorization: Bearer <accessToken>`
5. Run `products`
6. Run `addCartItem`
7. Run `cart`
8. Run `checkout`
9. Run `orders`

## Mutations

### 1. Register User

Use this to create a new auth user and matching user profile.

```graphql
mutation RegisterUser($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    userId
    email
  }
}
```

Variables:

```json
{
  "input": {
    "email": "deepak@example.com",
    "password": "Password123",
    "name": "Deepak"
  }
}
```

### 2. Login User

Use this to get a fresh access token and refresh token.

```graphql
mutation LoginUser($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
    userId
    email
  }
}
```

Variables:

```json
{
  "email": "deepak@example.com",
  "password": "Password123"
}
```

### 3. Refresh Token

Use this when your access token expires.

```graphql
mutation RefreshAuthToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
    userId
    email
  }
}
```

Variables:

```json
{
  "refreshToken": "Use the refreshToken returned by the register or login response"
}
```

### 4. Add Item To Cart

Requires `Authorization` header.

```graphql
mutation AddItemToCart($input: AddCartItemInput!) {
  addCartItem(input: $input) {
    id
    userId
    items {
      id
      productId
      quantity
      product {
        id
        name
        price
      }
    }
  }
}
```

Variables:

```json
{
  "input": {
    "productId": "86fe47e5-36c8-4e9b-9bf7-931eff09fb16",
    "quantity": 2
  }
}
```

### 5. Checkout

Requires `Authorization` header.

This converts the current cart into an order and clears the cart.

```graphql
mutation CheckoutCart($input: CheckoutInput!) {
  checkout(input: $input) {
    id
    userId
    status
    totalAmount
    createdAt
    items {
      id
      productId
      quantity
      unitPrice
      product {
        id
        name
        price
      }
    }
    user {
      id
      email
      name
    }
  }
}
```

Variables:

```json
{
  "input": {
    "shippingAddress": "221B Baker Street, London"
  }
}
```

## Queries

### 1. Get Current User

Requires `Authorization` header.

```graphql
query GetMe {
  me {
    id
    authUserId
    email
    name
    phone
    address
  }
}
```

### 2. Get All Products

Use this first to pick a product ID for cart testing.

```graphql
query GetProducts {
  products {
    id
    name
    description
    price
    inventoryCount
    category
    imageUrl
    isActive
  }
}
```

Current expected seeded response data:

```json
{
  "data": {
    "products": [
      {
        "id": "86fe47e5-36c8-4e9b-9bf7-931eff09fb16",
        "name": "Noise Cancelling Headphones",
        "description": "Premium wireless headphones with ANC",
        "price": 199.99,
        "inventoryCount": 120,
        "category": "electronics",
        "imageUrl": "https://example.com/headphones.jpg",
        "isActive": true
      },
      {
        "id": "c586871e-7ff0-4eb9-a962-7faa63c76fd2",
        "name": "Running Shoes",
        "description": "Lightweight running shoes for daily training",
        "price": 89.99,
        "inventoryCount": 250,
        "category": "fashion",
        "imageUrl": "https://example.com/shoes.jpg",
        "isActive": true
      },
      {
        "id": "f8fd642f-d3df-4f5c-a71a-999d6ff6d90d",
        "name": "Coffee Maker",
        "description": "Smart coffee maker with app scheduling",
        "price": 129.5,
        "inventoryCount": 75,
        "category": "home",
        "imageUrl": "https://example.com/coffee-maker.jpg",
        "isActive": true
      }
    ]
  }
}
```

### 3. Get One Product

```graphql
query GetProductById($id: ID!) {
  product(id: $id) {
    id
    name
    description
    price
    inventoryCount
    category
    imageUrl
    isActive
  }
}
```

Variables:

```json
{
  "id": "86fe47e5-36c8-4e9b-9bf7-931eff09fb16"
}
```

### 4. Get Cart

Requires `Authorization` header.

```graphql
query GetCart {
  cart {
    id
    userId
    items {
      id
      productId
      quantity
      product {
        id
        name
        price
        category
      }
    }
  }
}
```

### 5. Get Orders

Requires `Authorization` header.

```graphql
query GetOrders {
  orders {
    id
    userId
    status
    totalAmount
    createdAt
    user {
      id
      email
      name
    }
    items {
      id
      productId
      quantity
      unitPrice
      product {
        id
        name
        price
      }
    }
  }
}
```

## Sample Apollo Sandbox Headers

Use this in the Headers panel after login:

```json
{
  "Authorization": "Bearer <accessToken returned by login or register>"
}
```

## Current GraphQL Limitations

- No GraphQL mutation to create a product
- No GraphQL mutation to update a product
- No GraphQL mutation to update user profile
- No GraphQL mutation to remove cart item
- No GraphQL mutation to clear cart directly

If you want, I can add the missing GraphQL mutations next and extend this document afterward.
