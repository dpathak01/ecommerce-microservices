# Docker Notes

The root `docker-compose.yml` provisions the full local topology:

- GraphQL gateway
- 5 Fastify-based REST services
- 5 isolated PostgreSQL instances
- Redis for cache
- RabbitMQ for background events

For production images, each service has its own Dockerfile and can be pushed independently.

