# Dockerfile pour l'application Frontend Admin Next.js
# Utilise une approche multi-stage pour optimiser la taille de l'image

# Stage 1: Base image avec Node.js
FROM node:18-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de configuration des packages
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY tailwind.config.js ./

# Stage 2: Installation des dépendances
FROM base AS deps

# Installer les dépendances de production et de développement
RUN npm ci

# Stage 3: Builder - Construction de l'application
FROM base AS builder
WORKDIR /app

# Copier les dépendances depuis l'étape précédente
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY src ./src
COPY public ./public
COPY next-env.d.ts ./

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Construire l'application
RUN npm run build

# Stage 4: Runner - Image finale pour la production
FROM node:18-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers publics
COPY --from=builder /app/public ./public

# Copier les fichiers de build Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Variables d'environnement pour la production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Exposer le port
EXPOSE 3001

# Changer vers l'utilisateur non-root
USER nextjs

# Commande de démarrage
CMD ["node", "server.js"]
