#!/usr/bin/env bash
set -e

cd /home/$USER/app

echo "→ Actualizando código..."
git pull origin main

echo "→ Compilando frontend..."
cd client && npm ci && npm run build && cd ..

echo "→ Reconstruyendo y reiniciando contenedores..."
docker compose up -d --build

echo "→ Limpiando imágenes viejas..."
docker image prune -f

echo "✔ Deploy completado."
