# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig*.json nest-cli.json* ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production PORT=8000

# deps e artefatos
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 8000
# Use JSON form p/ evitar warning JSONArgsRecommended
CMD ["sh","-c","npx prisma migrate deploy || true; node dist/main.js"]
