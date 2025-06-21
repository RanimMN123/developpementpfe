#!/bin/sh

# Script de démarrage pour Railway
set -e

echo "🚀 Démarrage de l'application Railway..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 5

# Exécuter les migrations Prisma
echo "🔄 Exécution des migrations..."
npx prisma migrate deploy

# Générer le client Prisma (au cas où)
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Optionnel : Seed de la base de données
if [ "$NODE_ENV" = "production" ] && [ "$SEED_DB" = "true" ]; then
    echo "🌱 Seed de la base de données..."
    npx prisma db seed
fi

# Démarrer l'application
echo "✅ Démarrage du serveur NestJS..."
exec node dist/main.js
