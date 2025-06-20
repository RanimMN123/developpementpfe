# Dockerfile Railway - Version qui marche à coup sûr
FROM node:18

# Utiliser node standard (pas alpine) pour éviter les problèmes de compilation
WORKDIR /app

# Copier package.json
COPY package*.json ./

COPY prisma ./prisma

# Installer toutes les dépendances (dev + prod pour le build)
RUN npm install

# Copier tout le code
COPY . .

# Générer Prisma
RUN npx prisma generate

# Build l'application
RUN npm run build

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Créer dossier images
RUN mkdir -p public/images

# Exposer le port
EXPOSE 3000

# Commande simple
CMD ["node", "dist/main.js"]
