#!/bin/bash

# Script de déploiement cloud automatisé
set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Variables
ENVIRONMENT=${1:-staging}
VERSION=$(date +%Y%m%d-%H%M%S)
DOCKER_REGISTRY="ranimmn"
PROJECT_NAME="ranouma"

log "🚀 Démarrage du déploiement cloud"
log "📋 Environnement: $ENVIRONMENT"
log "🏷️ Version: $VERSION"

# Vérification des prérequis
log "🔍 Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé"
fi

success "Prérequis validés"

# Construction des images
log "🏗️ Construction des images Docker..."

# Backend
log "📦 Construction de l'image backend..."
docker build -t $DOCKER_REGISTRY/$PROJECT_NAME:backend-$VERSION -f backend/Dockerfile.prod backend/
docker tag $DOCKER_REGISTRY/$PROJECT_NAME:backend-$VERSION $DOCKER_REGISTRY/$PROJECT_NAME:backend-latest

# Frontend
log "🌐 Construction de l'image frontend..."
docker build -t $DOCKER_REGISTRY/$PROJECT_NAME:frontend-$VERSION -f frontend-admin/Dockerfile.prod frontend-admin/
docker tag $DOCKER_REGISTRY/$PROJECT_NAME:frontend-$VERSION $DOCKER_REGISTRY/$PROJECT_NAME:frontend-latest

success "Images construites avec succès"

# Push vers le registry
log "📤 Push des images vers le registry..."

if [ "$ENVIRONMENT" = "production" ]; then
    docker push $DOCKER_REGISTRY/$PROJECT_NAME:backend-$VERSION
    docker push $DOCKER_REGISTRY/$PROJECT_NAME:backend-latest
    docker push $DOCKER_REGISTRY/$PROJECT_NAME:frontend-$VERSION
    docker push $DOCKER_REGISTRY/$PROJECT_NAME:frontend-latest
    success "Images pushées vers le registry"
else
    warning "Mode staging - images non pushées"
fi

# Déploiement
log "🚀 Déploiement de l'application..."

# Arrêter les conteneurs existants
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Variables d'environnement
export BUILD_VERSION=$VERSION
export DOCKER_REGISTRY=$DOCKER_REGISTRY

# Démarrer les nouveaux conteneurs
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts
log "⏳ Attente du démarrage des services..."
sleep 30

# Health checks
log "🔍 Vérification de la santé des services..."

# Backend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    success "Backend opérationnel"
else
    error "Backend non accessible"
fi

# Frontend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success "Frontend opérationnel"
else
    error "Frontend non accessible"
fi

# Nettoyage des anciennes images
log "🧹 Nettoyage des anciennes images..."
docker image prune -f

# Résumé du déploiement
log "📊 Résumé du déploiement:"
echo "  🌍 Environnement: $ENVIRONMENT"
echo "  🏷️ Version: $VERSION"
echo "  🐳 Images déployées:"
echo "    - Backend: $DOCKER_REGISTRY/$PROJECT_NAME:backend-$VERSION"
echo "    - Frontend: $DOCKER_REGISTRY/$PROJECT_NAME:frontend-$VERSION"
echo "  🌐 URLs:"
echo "    - Backend: http://localhost:3000"
echo "    - Frontend: http://localhost:3001"

success "🎉 Déploiement terminé avec succès!"

# Afficher les logs en temps réel (optionnel)
if [ "$2" = "--logs" ]; then
    log "📋 Affichage des logs en temps réel..."
    docker-compose -f docker-compose.prod.yml logs -f
fi
