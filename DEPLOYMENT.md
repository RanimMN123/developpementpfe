# 🚀 Guide de Déploiement Cloud

## 📋 Vue d'ensemble

Ce guide explique comment déployer l'application Ranouma (backend + frontend) dans le cloud avec Docker et CI/CD.

## 🏗️ Architecture de Déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Frontend    │    │     Backend     │
│    (Nginx)      │────│   (React/Vite)  │────│   (NestJS)      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (Database)    │
                                               └─────────────────┘
```

## 🔧 Prérequis

### Outils requis
- Docker & Docker Compose
- Git
- Node.js 18+ (pour le développement)
- Compte Docker Hub
- Compte GitHub (pour CI/CD)

### Variables d'environnement
Configurez ces secrets dans GitHub :
- `DOCKER_USERNAME` : Nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD` : Token Docker Hub
- `POSTGRES_PASSWORD` : Mot de passe PostgreSQL
- `JWT_SECRET` : Clé secrète JWT

## 🚀 Déploiement Local

### 1. Déploiement rapide
```bash
# Cloner le repository
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo

# Rendre le script exécutable
chmod +x scripts/deploy-cloud.sh

# Déployer en staging
./scripts/deploy-cloud.sh staging

# Déployer en production
./scripts/deploy-cloud.sh production
```

### 2. Déploiement manuel
```bash
# Construire les images
docker build -t ranimmn/ranouma:backend-prod -f backend/Dockerfile.prod backend/
docker build -t ranimmn/ranouma:frontend-prod -f frontend-admin/Dockerfile.prod frontend-admin/

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ☁️ Déploiement Cloud

### AWS ECS (Recommandé)

1. **Préparer l'infrastructure**
```bash
# Créer un cluster ECS
aws ecs create-cluster --cluster-name ranouma-cluster

# Créer les groupes de logs
aws logs create-log-group --log-group-name /ecs/ranouma-backend
aws logs create-log-group --log-group-name /ecs/ranouma-frontend
aws logs create-log-group --log-group-name /ecs/ranouma-postgres
```

2. **Déployer avec la task definition**
```bash
# Enregistrer la task definition
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# Créer le service
aws ecs create-service \
  --cluster ranouma-cluster \
  --service-name ranouma-app \
  --task-definition ranouma-app:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Google Cloud Run

```bash
# Construire et pousser les images
docker build -t gcr.io/PROJECT_ID/ranouma-backend -f backend/Dockerfile.prod backend/
docker build -t gcr.io/PROJECT_ID/ranouma-frontend -f frontend-admin/Dockerfile.prod frontend-admin/

docker push gcr.io/PROJECT_ID/ranouma-backend
docker push gcr.io/PROJECT_ID/ranouma-frontend

# Déployer les services
gcloud run deploy ranouma-backend \
  --image gcr.io/PROJECT_ID/ranouma-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy ranouma-frontend \
  --image gcr.io/PROJECT_ID/ranouma-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
# Créer un groupe de ressources
az group create --name ranouma-rg --location eastus

# Déployer avec Docker Compose
az container create \
  --resource-group ranouma-rg \
  --file docker-compose.prod.yml
```

## 🔄 CI/CD avec GitHub Actions

### Configuration automatique

1. **Push vers la branche main**
```bash
git add .
git commit -m "feat: deploy to cloud"
git push origin main
```

2. **Le workflow se déclenche automatiquement :**
   - ✅ Tests et validation du code
   - 🏗️ Construction des images Docker
   - 📤 Push vers Docker Hub
   - 🚀 Déploiement automatique

### Déploiement manuel
```bash
# Déclencher un déploiement manuel
gh workflow run deploy.yml -f environment=production
```

## 📊 Monitoring et Logs

### Vérification de l'état
```bash
# Statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Health checks
curl http://localhost:3000/health  # Backend
curl http://localhost:3001/health  # Frontend
```

### Métriques importantes
- **CPU/Memory usage** : Surveiller via Docker stats
- **Response time** : Temps de réponse des APIs
- **Error rate** : Taux d'erreur des requêtes
- **Database connections** : Connexions PostgreSQL

## 🔒 Sécurité

### Bonnes pratiques appliquées
- ✅ Images multi-stage pour réduire la surface d'attaque
- ✅ Utilisateurs non-root dans les conteneurs
- ✅ Secrets gérés via variables d'environnement
- ✅ Health checks pour la résilience
- ✅ Headers de sécurité dans Nginx

### Variables sensibles
```bash
# Ne jamais commiter ces valeurs !
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-key
```

## 🚨 Dépannage

### Problèmes courants

1. **Conteneur qui ne démarre pas**
```bash
# Vérifier les logs
docker logs container-name

# Vérifier la configuration
docker inspect container-name
```

2. **Base de données inaccessible**
```bash
# Tester la connexion
docker exec -it postgres-container psql -U postgres -d adminapp
```

3. **Images non trouvées**
```bash
# Vérifier les images disponibles
docker images | grep ranouma

# Re-construire si nécessaire
docker build --no-cache -t ranimmn/ranouma:backend-latest -f backend/Dockerfile.prod backend/
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs des conteneurs
2. Consultez la documentation Docker
3. Ouvrez une issue sur GitHub

## 🎯 Prochaines étapes

- [ ] Configurer un nom de domaine
- [ ] Ajouter SSL/TLS avec Let's Encrypt
- [ ] Mettre en place la surveillance avec Prometheus
- [ ] Configurer les sauvegardes automatiques
- [ ] Optimiser les performances
