# Dockerfile simplifié pour le backend NestJS
FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache openssl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances en premier (pour le cache Docker)
COPY package*.json ./
COPY prisma ./prisma/

# Installer TOUTES les dépendances (nécessaire pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application
RUN npm run build

# Debug: Vérifier que le build a fonctionné
RUN echo "=== Contenu du dossier dist ===" && ls -la dist/ && echo "=== Fin du debug ==="

# Vérifier que main.js existe
RUN test -f dist/main.js && echo "✅ main.js trouvé" || echo "❌ main.js manquant"

# Créer les dossiers nécessaires
RUN mkdir -p /app/public/images

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/admin_db?schema=public"

# Commande de démarrage - utiliser le bon chemin
CMD ["node", "dist/src/main.js"]
