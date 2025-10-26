#!/bin/sh

# This script runs every time the container starts

echo "Entrypoint: Waiting for database to be ready..."

# pg_isready waits for a successful connection
# We use -d to specify the full URL
while ! pg_isready -d "${DATABASE_URL%%\?*}" -q; do
  echo "Database is not ready - sleeping"
  sleep 1
done

echo "Entrypoint: Applying database migrations..."

bunx prisma db push

echo "Entrypoint: Seeding database..."
bun run seed

echo "Entrypoint: Starting application..."

# Run the main command (bun run dev)
exec "$@"