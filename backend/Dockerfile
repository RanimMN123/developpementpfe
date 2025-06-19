# Dockerfile Railway - Version qui marche
FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer toutes les dépendances
RUN npm install

# Copier tout le code
COPY . .

# Générer Prisma
RUN npx prisma generate

# Build avec debug
RUN npm run build && echo "✅ Build réussi" || echo "❌ Build échoué"

# Vérifier le contenu
RUN ls -la dist/ || echo "Pas de dossier dist"

# Trouver le fichier main
RUN find . -name "main.js" -type f || echo "Aucun main.js trouvé"

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Créer dossier images
RUN mkdir -p public/images

# Exposer le port
EXPOSE 3000

# Commande de démarrage avec fallback
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; elif [ -f dist/src/main.js ]; then node dist/src/main.js; else echo 'Fichier main.js introuvable' && exit 1; fi"]
