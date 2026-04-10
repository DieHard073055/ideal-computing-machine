#!/bin/sh
set -e

echo "→ Running Prisma db push..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "→ Running seed..."
node prisma/seed.js 2>/dev/null || echo "  (seed skipped — already seeded or seed script not compiled)"

echo "→ Starting Next.js..."
exec "$@"
