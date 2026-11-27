# Imagen de la web de administración de EasyHair.
# Se construye en dos etapas: primero se compila Next.js y después
# solo se copia lo necesario para correrlo.

# ---- Etapa 1: instalar dependencias y compilar ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# La URL del backend queda dentro del código al compilar (por eso es ARG y no ENV)
ARG NEXT_PUBLIC_API_URL=http://54.152.113.142
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Etapa 2: solo lo que se necesita para correr ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
