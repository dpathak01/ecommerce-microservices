FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --workspace order-service
RUN npm run prisma:generate --workspace order-service
RUN npm run build --workspace order-service

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY . .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/order-service/dist services/order-service/dist
COPY --from=build /app/services/order-service/src/generated services/order-service/dist/generated
CMD ["npm", "run", "start", "--workspace", "order-service"]
