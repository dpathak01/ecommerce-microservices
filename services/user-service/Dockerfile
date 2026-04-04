FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --workspace user-service
RUN npm run prisma:generate --workspace user-service
RUN npm run build --workspace user-service

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY . .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/user-service/dist services/user-service/dist
COPY --from=build /app/services/user-service/src/generated services/user-service/dist/generated
CMD ["npm", "run", "start", "--workspace", "user-service"]
