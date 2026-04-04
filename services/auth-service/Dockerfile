FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --workspace auth-service
RUN npm run prisma:generate --workspace auth-service
RUN npm run build --workspace auth-service

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY . .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/auth-service/dist services/auth-service/dist
COPY --from=build /app/services/auth-service/src/generated services/auth-service/dist/generated
CMD ["npm", "run", "start", "--workspace", "auth-service"]
