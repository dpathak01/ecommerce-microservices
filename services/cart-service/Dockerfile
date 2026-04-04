FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --workspace cart-service
RUN npm run prisma:generate --workspace cart-service
RUN npm run build --workspace cart-service

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY . .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/cart-service/dist services/cart-service/dist
COPY --from=build /app/services/cart-service/src/generated services/cart-service/dist/generated
CMD ["npm", "run", "start", "--workspace", "cart-service"]
