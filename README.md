# Production-Grade E-commerce Microservices

## 1. Project Overview

This repository contains a production-style e-commerce backend built with Node.js, TypeScript, GraphQL, REST microservices, PostgreSQL, Redis, RabbitMQ, Docker, and AWS deployment scaffolding.

The system models a marketplace workflow similar to Amazon or Zomato-style platforms:

- user identity and profile management
- product catalog browsing
- cart lifecycle management
- order placement and asynchronous order notifications
- a single GraphQL BFF for frontend clients

## 2. Architecture Explanation

### High-level architecture

```text
Client Apps
   |
   v
AWS API Gateway / Load Balancer
   |
   v
GraphQL Gateway (Apollo Server)
   |
   +--> auth-service ------> auth-db (PostgreSQL)
   +--> user-service ------> user-db (PostgreSQL)
   +--> product-service ---> product-db (PostgreSQL)
   +--> cart-service ------> cart-db (PostgreSQL)
   +--> order-service -----> order-db (PostgreSQL)
   |
   +--> Redis (cache, short-lived lookups)
   +--> RabbitMQ (order.created -> email.notifications)
```

### Service interaction flow

1. A client calls `/graphql` on the gateway.
2. The gateway verifies JWTs and enriches the request context.
3. Resolvers aggregate data from REST services.
4. DataLoader batches repeated user and product lookups.
5. Services persist to isolated PostgreSQL databases through Prisma.
6. Redis handles cache-aside access for hot reads.
7. `order-service` emits an `order.created` event to RabbitMQ.
8. A notification consumer simulates email dispatch in the background.

## 3. Tech Stack Explanation

- Node.js + TypeScript: strict, type-safe backend implementation
- Apollo Server: GraphQL gateway / BFF
- Fastify: REST microservices with low overhead
- PostgreSQL: one database per service for bounded context isolation
- Prisma ORM: schema-driven data modeling and database access
- Redis: caching and fast shared state
- RabbitMQ: asynchronous order processing and notification events
- Docker + Docker Compose: local orchestration and packaging
- AWS ECS + RDS + ElastiCache + API Gateway: production deployment targets
- GitHub Actions: CI/CD automation

## 4. Installation Steps

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

### Install dependencies

```bash
npm install
```

### Copy environment files

```bash
cp .env.example .env
cp gateway/.env.example gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/user-service/.env.example services/user-service/.env
cp services/product-service/.env.example services/product-service/.env
cp services/cart-service/.env.example services/cart-service/.env
cp services/order-service/.env.example services/order-service/.env
```

For local host-run services, the copied service `.env` files use `localhost` plus the Docker-published ports:

- auth db: `localhost:5433`
- user db: `localhost:5434`
- product db: `localhost:5435`
- cart db: `localhost:5436`
- order db: `localhost:5437`
- redis: `localhost:6379`
- rabbitmq: `localhost:5672`

Inside Docker Compose, service-to-service environment variables still use container hostnames such as `auth-db` and `redis`.

### Start the full system

```bash
docker-compose up --build
```

### Generate Prisma clients

```bash
npm run prisma:generate
```

### Run migrations locally

```bash
npm run prisma:migrate --workspace auth-service
npm run prisma:migrate --workspace user-service
npm run prisma:migrate --workspace product-service
npm run prisma:migrate --workspace cart-service
npm run prisma:migrate --workspace order-service
```

## 5. Running Services

### Local run

Run each service independently:

```bash
npm run dev --workspace auth-service
npm run dev --workspace user-service
npm run dev --workspace product-service
npm run dev --workspace cart-service
npm run dev --workspace order-service
npm run dev --workspace gateway
```

### Docker run

```bash
docker-compose up --build
```

GraphQL gateway: `http://localhost:4000/graphql`

REST services:

- Auth: `http://localhost:4001`
- User: `http://localhost:4002`
- Product: `http://localhost:4003`
- Cart: `http://localhost:4004`
- Order: `http://localhost:4005`

## 6. API Usage

### GraphQL queries

Register:

```graphql
mutation Register {
  register(input: {
    email: "deepak@example.com"
    password: "Password123"
    name: "Deepak"
  }) {
    accessToken
    refreshToken
    userId
    email
  }
}
```

Login:

```graphql
mutation Login {
  login(email: "deepak@example.com", password: "Password123") {
    accessToken
    refreshToken
    userId
    email
  }
}
```

Browse products:

```graphql
query Products {
  products {
    id
    name
    price
    inventoryCount
    category
  }
}
```

Authenticated cart lookup:

```graphql
query Cart {
  cart {
    id
    items {
      id
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

Checkout:

```graphql
mutation Checkout {
  checkout(input: { shippingAddress: "221B Baker Street, London" }) {
    id
    status
    totalAmount
  }
}
```

### REST endpoints per service

Auth service:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/validate`

User service:

- `POST /users`
- `GET /users/:authUserId`
- `POST /users/bulk`
- `PUT /users/:authUserId`

Product service:

- `GET /products`
- `GET /products/:id`
- `POST /products/bulk`
- `POST /products`
- `PUT /products/:id`

Cart service:

- `GET /cart/:userId`
- `POST /cart/:userId/items`
- `PUT /cart/:userId/items/:itemId`
- `DELETE /cart/:userId/items/:itemId`
- `DELETE /cart/:userId/clear`

Order service:

- `POST /orders`
- `GET /orders/:id`
- `GET /orders/user/:userId`

## 7. Build Commands

```bash
npm run build
npm run start --workspace gateway
npm run start --workspace auth-service
```

## 8. Deployment Guide (AWS)

### Recommended AWS topology

1. Push all service images to ECR or GHCR.
2. Deploy the GraphQL gateway and each REST service to ECS Fargate.
3. Provision one RDS PostgreSQL database per service boundary, ideally one instance with separate DBs for smaller environments or isolated clusters for stricter blast-radius control.
4. Provision ElastiCache Redis for shared cache and low-latency lookups.
5. Provision Amazon MQ for RabbitMQ, or replace RabbitMQ with SQS/EventBridge for a more managed event backbone.
6. Put API Gateway or an ALB in front of the GraphQL gateway only.
7. Store secrets in AWS Secrets Manager or SSM Parameter Store.

### ECS / EKS setup notes

- `infra/aws/ecs-task-definition.json` contains a Fargate-ready task definition template.
- `infra/aws/api-gateway-openapi.yaml` shows a simple API Gateway proxy contract for `/graphql`.
- If you prefer EKS, keep the same container boundaries and expose only the gateway with an Ingress.

### RDS PostgreSQL

- Create separate databases: `auth_db`, `user_db`, `product_db`, `cart_db`, `order_db`
- Run Prisma migrations in a deployment job or one-off task
- Enable automated backups and Multi-AZ for production

### ElastiCache Redis

- Use Redis for cache-aside reads
- Set low TTLs for mutable entities
- Invalidate cache on writes, which is how the services are implemented here

### API Gateway setup

- Route only `/graphql`
- Add AWS WAF, throttling, JWT-aware authorizers if needed
- Enforce TLS, request size limits, and request logging

## 9. CI/CD Flow

The GitHub Actions pipeline does the following:

1. installs dependencies
2. generates Prisma clients
3. type-checks and builds all workspaces
4. builds and pushes Docker images to GHCR
5. deploys the gateway task definition to ECS

You should add separate deployment stages for the REST services or package them in the same ECS stack, depending on your rollout model.

## 10. Future Improvements

- Observability with Prometheus, Grafana, Loki, and structured dashboards
- Distributed tracing with OpenTelemetry
- Circuit breakers and retries for service-to-service calls
- Idempotency keys for checkout
- Inventory reservation and saga orchestration
- Contract testing between gateway and services
- Dedicated worker deployment for notifications and async jobs
- Rate limiting and persisted GraphQL operations

## Project Structure

```text
ecommerce-microservices/
├── gateway/
├── services/
│   ├── user-service/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   └── auth-service/
├── infra/
│   ├── docker/
│   ├── aws/
│   └── k8s/
├── .github/workflows/
├── docker-compose.yml
└── README.md
```

## Operational Notes

- JWT verification happens at the GraphQL gateway using the shared signing secret.
- The gateway applies a simple rate limiter and is the only public entry point.
- Redis is used with a cache-aside pattern and explicit invalidation on writes.
- RabbitMQ is used for `order.created` notifications.
- Each service is independently runnable and owns its own Prisma schema plus migration files.
