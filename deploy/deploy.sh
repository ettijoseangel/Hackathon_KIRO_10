#!/usr/bin/env bash
set -e

APP_DIR="/home/ubuntu/app"
cd "$APP_DIR"

echo "→ Actualizando código..."
git pull origin main

echo "→ Verificando symlink de .env en server/..."
if [ ! -e server/.env ]; then
    ln -s ../.env server/.env
    echo "  symlink creado: server/.env -> ../.env"
fi

echo "→ Instalando dependencias y compilando frontend..."
cd client
npm ci
npm run build
cd ..

echo "→ Instalando dependencias del backend..."
cd server
npm ci

echo "→ Aplicando migraciones de Prisma..."
npx prisma generate
npx prisma migrate deploy
cd ..

echo "→ Reconstruyendo y reiniciando contenedores (solo docker-compose.yml, sin override de dev)..."
docker compose -f docker-compose.yml up -d --build

echo "→ Esperando a que los contenedores arranquen..."
sleep 5

echo "→ Estado de los contenedores:"
docker compose -f docker-compose.yml ps

echo "→ Limpiando imágenes viejas..."
docker image prune -f

echo "✔ Deploy completado."
echo ""
echo "Logs recientes de la API:"
docker compose -f docker-compose.yml logs --tail=15 api