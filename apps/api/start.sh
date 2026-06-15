#!/bin/sh
set -e

echo "Running Prisma migrations..."
cd /app/packages/database
npx prisma migrate deploy

echo "Starting Shopified API..."
cd /app/apps/api
exec node dist/main.js
