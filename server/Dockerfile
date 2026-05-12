# Stage 1: build client
FROM node:20-slim AS client-builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: build server
FROM node:20-slim AS server-builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/prisma ./prisma
RUN npx prisma generate
COPY server/tsconfig.json .
COPY server/src ./src
RUN npm run build

# Stage 3: runtime
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --from=server-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=server-builder /app/dist ./dist
COPY server/prisma ./prisma
COPY --from=client-builder /app/dist ./client-dist
RUN mkdir -p uploads
EXPOSE 4000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/index.js"]
