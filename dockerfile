# --- Etapa 1: build del frontend (Vite) ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Etapa 2: backend (Express) + assets del frontend ---
FROM node:20-alpine AS server
WORKDIR /server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY . .

COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]