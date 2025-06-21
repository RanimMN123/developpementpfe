# 🐳 Guide Docker - Application Admin

Ce guide vous explique comment dockeriser et déployer l'application complète avec Docker.

## 📋 Prérequis

- **Docker Desktop** installé et en cours d'exécution
- **Git** pour cloner le projet
- **PowerShell** (Windows) ou **Bash** (Linux/Mac)

## 🚀 Démarrage rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd developpementpfe
```

### 2. Démarrer avec Docker
```powershell
# Windows PowerShell
.\scripts\docker-start.ps1

# Ou manuellement
docker compose up --build -d
```

### 3. Exécuter les migrations
```powershell
# Windows PowerShell
.\scripts\docker-migrate.ps1

# Ou manuellement
docker compose exec backend npx prisma migrate deploy
```

## 🌐 Accès aux services

Une fois démarré, l'application est accessible sur :

- **🔗 Backend API** : http://localhost:3000
- **🌐 Frontend Admin** : http://localhost:3001 (si configuré)
- **🗄️ Base de données** : localhost:5432
- **📱 Mobile** : Utilisez l'IP de votre PC (ex: 192.168.100.187:3000)

## 📱 Configuration Mobile

Avec Docker, l'IP du backend change. Mettez à jour la configuration mobile :

### Option 1: Utiliser localhost (si mobile et PC sur même machine)
```javascript
// mobile/config/api.js
const COMMON_IPS = [
  "localhost:3000",
  "127.0.0.1:3000",
  // ... autres IPs
];
```

### Option 2: Utiliser l'IP de votre PC
```powershell
# Trouver l'IP de votre PC
ipconfig | findstr "IPv4"
```

Puis mettre à jour :
```javascript
// mobile/config/api.js
const COMMON_IPS = [
  "192.168.100.187:3000", // Remplacez par votre IP
  "localhost:3000",
  // ... autres IPs
];
```

## 🛠️ Commandes utiles

### Gestion des conteneurs
```bash
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Redémarrer un service
docker compose restart backend

# Voir les logs
docker compose logs -f backend

# Voir le statut
docker compose ps
```

### Base de données
```bash
# Migrations
docker compose exec backend npx prisma migrate deploy

# Seed
docker compose exec backend npx prisma db seed

# Studio (interface graphique)
docker compose exec backend npx prisma studio

# Reset complet
docker compose exec backend npx prisma migrate reset
```

### Développement
```bash
# Reconstruire une image
docker compose build backend

# Accéder au conteneur
docker compose exec backend sh

# Voir les logs en temps réel
docker compose logs -f
```

## 🔧 Configuration avancée

### Variables d'environnement

Créez un fichier `.env` dans le dossier racine :

```env
# Base de données
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Azerty123*
POSTGRES_DB=adminapp

# Backend
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000

# URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000
```

### Volumes persistants

Les données sont sauvegardées dans des volumes Docker :
- `postgres-data` : Données de la base
- `backend_uploads` : Images uploadées
- `backend_logs` : Logs de l'application

### Réseau

Les services communiquent via un réseau Docker privé (`172.20.0.0/16`).

## 🚨 Dépannage

### Problème : Port déjà utilisé
```bash
# Voir qui utilise le port 3000
netstat -ano | findstr :3000

# Arrêter tous les conteneurs
docker compose down

# Nettoyer
docker system prune -f
```

### Problème : Base de données inaccessible
```bash
# Vérifier le statut de PostgreSQL
docker compose exec postgres pg_isready -U postgres

# Voir les logs
docker compose logs postgres

# Redémarrer PostgreSQL
docker compose restart postgres
```

### Problème : Images non trouvées
```bash
# Vérifier les volumes
docker volume ls

# Recréer les volumes
docker compose down -v
docker compose up -d
```

## 📦 Déploiement en production

### 1. Optimisations
- Utilisez des images multi-stage
- Configurez un reverse proxy (Nginx)
- Activez HTTPS
- Configurez les logs centralisés

### 2. Sécurité
- Changez tous les mots de passe par défaut
- Utilisez des secrets Docker
- Limitez les ports exposés
- Configurez un firewall

### 3. Monitoring
- Ajoutez des health checks
- Configurez des alertes
- Surveillez les ressources

## 🎯 Avantages de Docker

✅ **Consistance** : Même environnement partout
✅ **Isolation** : Pas de conflits de dépendances  
✅ **Portabilité** : Fonctionne sur n'importe quel système
✅ **Scalabilité** : Facile à déployer et scaler
✅ **Maintenance** : Mises à jour simplifiées

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker compose logs -f`
2. Vérifiez le statut : `docker compose ps`
3. Redémarrez les services : `docker compose restart`
4. Nettoyez et redémarrez : `docker compose down && docker compose up -d`
