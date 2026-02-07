# Dockerfile para Frontend Next.js
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiar código y construir
COPY . .
# Argumento de variable de entorno para el build (la URL de la API de producción)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage de producción
FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
