# 🆓 Guide de Déploiement Gratuit avec CI/CD

## 🎯 Plateformes Gratuites Supportées

### 🚂 Railway (Recommandé)
- ✅ **500h/mois gratuit**
- ✅ Base de données PostgreSQL incluse
- ✅ Déploiement automatique via GitHub
- ✅ SSL automatique
- ✅ Domaines personnalisés

### 🎨 Render.com
- ✅ Services web gratuits
- ✅ Base de données PostgreSQL gratuite (90 jours)
- ✅ CI/CD intégré
- ✅ SSL automatique

### 🪰 Fly.io
- ✅ 3 applications gratuites
- ✅ 256MB RAM par app
- ✅ Déploiement Docker natif
- ✅ Régions multiples

## 🚀 Déploiement Railway (Le plus simple)

### 1. Préparation
```bash
# 1. Créer un compte sur Railway.app
# 2. Connecter votre repository GitHub
# 3. Créer un nouveau projet
```

### 2. Configuration des variables d'environnement
Dans Railway Dashboard :
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://... (généré automatiquement)
PORT=3000
```

### 3. Déploiement automatique
```bash
# Push vers GitHub déclenche automatiquement le déploiement
git add .
git commit -m "feat: deploy to railway"
git push origin main
```

### 4. Configuration des services
- **Backend** : Utilise `backend/Dockerfile.railway`
- **Frontend** : Utilise `frontend-admin/Dockerfile.railway`
- **Database** : PostgreSQL automatiquement provisionné

## 🎨 Déploiement Render.com

### 1. Préparation
```bash
# 1. Créer un compte sur Render.com
# 2. Connecter votre repository GitHub
# 3. Utiliser le fichier render.yaml
```

### 2. Configuration automatique
Le fichier `render.yaml` configure automatiquement :
- Base de données PostgreSQL
- Service backend NestJS
- Service frontend React
- Variables d'environnement

### 3. Déploiement
```bash
# Push vers GitHub déclenche le déploiement
git push origin main
```

## 🪰 Déploiement Fly.io

### 1. Installation Fly CLI
```bash
# Windows
iwr https://fly.io/install.ps1 -useb | iex

# macOS/Linux
curl -L https://fly.io/install.sh | sh
```

### 2. Authentification
```bash
flyctl auth login
```

### 3. Déploiement Backend
```bash
cd backend
flyctl launch --dockerfile Dockerfile.railway
flyctl deploy
```

### 4. Déploiement Frontend
```bash
cd frontend-admin
flyctl launch --dockerfile Dockerfile.railway
flyctl deploy
```

## 🔧 Configuration GitHub Secrets

Pour activer le CI/CD automatique, configurez ces secrets dans GitHub :

### Railway
```
RAILWAY_TOKEN=your-railway-token
```

### Render
```
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-service-id
```

### Fly.io
```
FLY_API_TOKEN=your-fly-token
FLY_BACKEND_APP=ranouma-backend
FLY_FRONTEND_APP=ranouma-frontend
```

### Généraux
```
DOCKER_USERNAME=ranimmn
DOCKER_PASSWORD=your-docker-token
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
```

## 📱 Mise à jour de l'application mobile

Une fois déployé, mettez à jour la configuration mobile :

```javascript
// mobile/config/api.js
const COMMON_IPS = [
  "your-backend-url.railway.app:443",  // Railway
  "your-backend.onrender.com:443",     // Render
  "your-backend.fly.dev:443",          // Fly.io
  "192.168.100.187:3000",              // Local
  // ... autres IPs
];
```

## 🔄 Workflow CI/CD

### Déclenchement automatique
1. **Push vers main** → Tests → Build → Deploy
2. **Pull Request** → Tests uniquement
3. **Manual trigger** → Deploy vers environnement spécifique

### Étapes du pipeline
1. ✅ **Tests** : Backend + Frontend
2. 🏗️ **Build** : Images Docker
3. 📤 **Push** : Vers Docker Hub
4. 🚀 **Deploy** : Vers plateforme choisie
5. 🔍 **Health Check** : Vérification post-déploiement

## 💰 Coûts et Limites

### Railway (Gratuit)
- 500h/mois d'exécution
- 1GB RAM
- 1GB stockage
- Trafic illimité

### Render (Gratuit)
- 750h/mois d'exécution
- 512MB RAM
- 1GB stockage
- 100GB bande passante

### Fly.io (Gratuit)
- 3 applications
- 256MB RAM par app
- 3GB stockage total
- 160GB bande passante

## 🚨 Dépannage

### Problèmes courants

1. **Build qui échoue**
```bash
# Vérifier les logs de build
flyctl logs -a your-app-name
```

2. **Base de données inaccessible**
```bash
# Vérifier la connection string
echo $DATABASE_URL
```

3. **Variables d'environnement manquantes**
```bash
# Railway
railway variables

# Render
# Vérifier dans le dashboard

# Fly.io
flyctl secrets list
```

## 🎯 Recommandations

### Pour débuter : **Railway**
- Configuration la plus simple
- Base de données incluse
- Déploiement en un clic

### Pour la production : **Fly.io**
- Plus de contrôle
- Meilleure performance
- Régions multiples

### Pour les projets simples : **Render**
- Interface intuitive
- Configuration YAML
- Bon pour les sites statiques

## 📞 Support

- **Railway** : [docs.railway.app](https://docs.railway.app)
- **Render** : [render.com/docs](https://render.com/docs)
- **Fly.io** : [fly.io/docs](https://fly.io/docs)

## 🎉 Prochaines étapes

1. ✅ Choisir une plateforme
2. 🔧 Configurer les secrets GitHub
3. 🚀 Push vers main pour déclencher le déploiement
4. 📱 Mettre à jour l'APK mobile avec les nouvelles URLs
5. 🌐 Configurer un domaine personnalisé (optionnel)
