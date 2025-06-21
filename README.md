# 🚀 Ranouma - Application de Gestion Commerciale

## 📋 Vue d'ensemble

Ranouma est une application complète de gestion commerciale comprenant :
- 🖥️ **Backend NestJS** avec API REST et base de données PostgreSQL
- 🌐 **Frontend React** pour l'administration web
- 📱 **Application mobile React Native** pour les commerciaux
- 🐳 **Déploiement Docker** avec CI/CD automatique

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Frontend Web  │    │     Backend     │
│ (React Native)  │────│    (React)      │────│   (NestJS)      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (Database)    │
                                               └─────────────────┘
```

## ✨ Fonctionnalités

### 📱 Application Mobile
- ✅ Authentification sécurisée
- ✅ Gestion des clients et commandes
- ✅ Catalogue produits avec images
- ✅ Dashboard avec statistiques temps réel
- ✅ Système de caisse automatique
- ✅ Auto-discovery du backend

### 🌐 Interface Web Admin
- ✅ Gestion complète des produits et catégories
- ✅ Suivi des commandes et livraisons
- ✅ Gestion des agents commerciaux
- ✅ Statistiques et rapports
- ✅ Interface responsive

### 🔧 Backend API
- ✅ API REST complète
- ✅ Authentification JWT
- ✅ Protection CSRF/XSS
- ✅ Upload d'images
- ✅ Base de données Prisma
- ✅ Rate limiting

## 🚀 Déploiement Rapide

### Option 1: Déploiement Cloud Gratuit (Recommandé)

#### Railway (Le plus simple)
1. Aller sur [railway.app](https://railway.app)
2. Connecter votre repository GitHub
3. Déploiement automatique !

#### Render.com
1. Aller sur [render.com](https://render.com)
2. Connecter votre repository GitHub
3. Utilise automatiquement `render.yaml`

#### Fly.io
```bash
# Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# Déployer backend
cd backend && flyctl launch

# Déployer frontend
cd frontend-admin && flyctl launch
```

### Option 2: Déploiement Local avec Docker

```bash
# Cloner le repository
git clone https://github.com/votre-username/ranouma.git
cd ranouma

# Démarrer avec Docker Compose
docker-compose up -d

# Accéder aux applications
# Backend: http://localhost:3000
# Frontend: http://localhost:3001
```

## 📱 Application Mobile

### APK Prêt à l'emploi
- **Lien de téléchargement**: [APK Mobile](https://expo.dev/artifacts/eas/vyBhCcbBQJ65Uk51n7yhNK.apk)
- **Identifiants de test**: `test@test.com` / `Test123!`

### Build depuis les sources
```bash
cd mobile
npm install
npx eas build --platform android --profile preview
```

## 🔧 Configuration

### Variables d'environnement

#### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/adminapp
JWT_SECRET=your-super-secret-key
PORT=3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
NODE_ENV=production
```

## 🔄 CI/CD Automatique

Le projet inclut GitHub Actions pour :
- ✅ Tests automatiques
- ✅ Build des images Docker
- ✅ Déploiement multi-plateformes
- ✅ Health checks

### Configuration des secrets GitHub
```
RAILWAY_TOKEN=your-railway-token
RENDER_API_KEY=your-render-api-key
FLY_API_TOKEN=your-fly-token
JWT_SECRET=your-jwt-secret
POSTGRES_PASSWORD=your-secure-password
```

## 📚 Documentation

- 📖 [Guide de déploiement gratuit](./DEPLOY-FREE.md)
- 🐳 [Guide Docker complet](./DEPLOYMENT.md)
- 🔒 [Rapport de sécurité](./RAPPORT_SECURITE_XSS_CSRF.md)
- 📱 [Guide mobile](./mobile/README.md)
- 🌐 [Guide frontend](./frontend-admin/README.md)
- 🔧 [Guide backend](./backend/README.md)

## 🛠️ Développement Local

### Prérequis
- Node.js 18+
- PostgreSQL
- Docker (optionnel)

### Installation
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend-admin
npm install
npm run dev

# Mobile
cd mobile
npm install
npx expo start
```

## 🔒 Sécurité

- ✅ Protection CSRF/XSS
- ✅ Authentification JWT
- ✅ Rate limiting
- ✅ Validation des données
- ✅ Headers de sécurité
- ✅ Utilisateurs non-root dans Docker

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /health`

### Logs
```bash
# Docker logs
docker-compose logs -f

# Application logs
npm run logs
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- 📧 Email: support@ranouma.com
- 📱 Issues GitHub: [Issues](https://github.com/votre-username/ranouma/issues)
- 📖 Documentation: [Wiki](https://github.com/votre-username/ranouma/wiki)

## 🎯 Roadmap

- [ ] Notifications push mobiles
- [ ] Synchronisation offline
- [ ] API GraphQL
- [ ] Tests automatisés complets
- [ ] Monitoring avancé
- [ ] Multi-tenant

---

**🎉 Développé avec ❤️ pour simplifier la gestion commerciale**
