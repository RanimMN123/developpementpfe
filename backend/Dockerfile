# Dockerfile Railway - Version qui marche à coup sûr
FROM node:18

# Utiliser node standard (pas alpine) pour éviter les problèmes de compilation
WORKDIR /app

# Copier package.json
COPY package*.json ./

COPY prisma ./prisma

# Générer Prisma
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Installer toutes les dépendances (dev + prod pour le build)
RUN npm install

# Copier tout le code
COPY . .

# Build l'application
RUN npm run build

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Créer dossier images
RUN mkdir -p public/images

# Exposer le port
EXPOSE 3000

# Créer un script de démarrage avec attente de la base de données
RUN echo '#!/bin/bash\n\
echo "Attente de la base de données..."\n\
while ! nc -z postgres 5432; do\n\
  echo "En attente de PostgreSQL..."\n\
  sleep 2\n\
done\n\
echo "PostgreSQL est prêt!"\n\
echo "Exécution des migrations..."\n\
npx prisma migrate deploy || echo "Migrations échouées ou déjà appliquées"\n\
echo "Démarrage de l'\''application..."\n\
node dist/src/main.js' > /app/start.sh && chmod +x /app/start.sh

# Installer netcat pour le test de connexion
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

# Commande avec script de démarrage
CMD ["/app/start.sh"]
