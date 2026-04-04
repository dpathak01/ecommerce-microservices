# Kubernetes Notes

This repository targets ECS in the default deployment path, but the service boundaries and container images are ready for Kubernetes packaging.

Recommended next steps:

1. Create one Deployment and one ClusterIP Service per microservice.
2. Store secrets in AWS Secrets Manager or External Secrets Operator.
3. Expose only the GraphQL gateway through an Ingress or API Gateway integration.
4. Add HPA rules for product-service, cart-service, and gateway based on CPU and request latency.

