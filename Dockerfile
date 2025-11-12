# ============
# Build stage
# ============
FROM node:20-alpine AS build
WORKDIR /app

# Toolchain + headers p/ node-canvas
# (openssl já fica aqui para o prisma generate)
RUN apk add --no-cache \
  openssl \
  python3 make g++ pkgconfig \
  cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev

# Ajuda o node-gyp a achar o Python
RUN ln -sf /usr/bin/python3 /usr/bin/python && \
    npm config set python "/usr/bin/python3"

# Instala dependências antes de copiar o resto (melhor cache)
COPY package*.json ./
RUN npm ci

# Código e configs
COPY prisma ./prisma
COPY tsconfig*.json nest-cli.json* ./
COPY src ./src

# Prisma + build da app
RUN npx prisma generate
RUN npm run build

# ==============
# Runtime stage
# ==============
FROM node:20-alpine AS runtime
WORKDIR /app

# Somente libs de execução (sem -dev)
RUN apk add --no-cache \
  openssl \
  cairo pango jpeg giflib librsvg pixman

ENV NODE_ENV=production
ENV PORT=8000

# Artefatos do build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 8000

# Migra silenciosa (se falhar, não derruba) e inicia app
CMD ["sh","-c","npx prisma migrate deploy || true; node dist/main.js"]
