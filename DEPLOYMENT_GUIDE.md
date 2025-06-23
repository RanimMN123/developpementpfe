# 🚀 Guide de Déploiement - Application Admin Complète

## 📋 Vue d'ensemble

Cette application est maintenant entièrement dockerisée et prête pour le déploiement en production.

### 🏗️ Architecture

- **Backend NestJS** : API REST avec base de données PostgreSQL
- **Frontend Admin** : Interface d'administration Next.js
- **Mobile App** : Application React Native avec auto-découverte IP
- **Base de données** : PostgreSQL avec Prisma ORM

## 🐳 Images Docker Disponibles

### Backend
- **Image principale** : `ranimmn/ranouma:backend-working-18-06-2025`
- **Tag latest** : `ranimmn/ranouma:backend-latest`
- **Fonctionnalités** : API complète, gestion des images, authentification JWT

### Frontend
- **Image principale** : `ranimmn/ranouma:front18-06-2025`
- **Fonctionnalités** : Interface admin complète, gestion des produits/commandes

## 🚀 Déploiement Rapide

### Option 1 : Docker Compose (Recommandé)

```bash
# Cloner le projet
git clone <votre-repo>
cd developpementpfe

# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

### Option 2 : Conteneurs individuels

```bash
# Backend
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/adminapp?schema=public" \
  ranimmn/ranouma:backend-latest

# Frontend
docker run -d -p 3001:3001 \
  ranimmn/ranouma:front18-06-2025
```

## 🌐 Accès aux Services

Une fois déployé, l'application est accessible sur :

- **🔗 Backend API** : http://localhost:3000
- **🌐 Frontend Admin** : http://localhost:3001
- **📱 Mobile** : Auto-découverte IP (localhost:3000 ou IP du serveur)

## 📱 Configuration Mobile

L'application mobile utilise un système d'auto-découverte intelligent :

1. **Priorité 1** : localhost:3000 (pour développement local)
2. **Priorité 2** : IP du serveur de déploiement
3. **Fallback** : Scan automatique du réseau

### Configuration manuelle (si nécessaire)

```javascript
// mobile/services/GlobalIPManager.js
this.commonIPs = [
  'votre-serveur.com',     // Domaine de production
  'localhost',             // Développement local
  '192.168.1.100',        // IP serveur local
  // ... autres IPs
];
```

## 🗄️ Base de Données

### Configuration PostgreSQL

```sql
-- Créer la base de données
CREATE DATABASE adminapp;
CREATE USER postgres WITH PASSWORD 'Azerty123*';
GRANT ALL PRIVILEGES ON DATABASE adminapp TO postgres;
```

### Variables d'environnement

```env
DATABASE_URL="postgresql://postgres:Azerty123*@localhost:5432/adminapp?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="production"
PORT="3000"
```

## 🔧 Configuration Avancée

### Nginx Reverse Proxy (Production)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend Admin
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/HTTPS (Production)

```bash
# Avec Certbot
sudo certbot --nginx -d votre-domaine.com
```

## 📊 Monitoring et Logs

### Vérifier les logs

```bash
# Logs backend
docker logs admin_backend

# Logs frontend
docker logs admin_frontend

# Logs en temps réel
docker-compose logs -f
```

### Health Checks

- **Backend** : http://localhost:3000/test/ping
- **Frontend** : http://localhost:3001
- **Base de données** : Vérification automatique via Prisma

## 🔒 Sécurité

### Variables à changer en production

1. **JWT_SECRET** : Générer une clé secrète forte
2. **DATABASE_PASSWORD** : Utiliser un mot de passe complexe
3. **CORS** : Configurer les domaines autorisés
4. **HTTPS** : Activer SSL en production

### Firewall

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Backend (si accès direct)
sudo ufw allow 3001  # Frontend (si accès direct)
```

## 🚨 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Base de données inaccessible**
   ```bash
   docker-compose restart postgres
   ```

3. **Images non trouvées**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Commandes utiles

```bash
# Redémarrer tous les services
docker-compose restart

# Voir l'utilisation des ressources
docker stats

# Nettoyer les conteneurs arrêtés
docker system prune

# Sauvegarder la base de données
docker exec admin_postgres pg_dump -U postgres adminapp > backup.sql
```

## 📈 Mise à jour

### Déployer une nouvelle version

```bash
# Arrêter les services
docker-compose down

# Mettre à jour les images
docker-compose pull

# Redémarrer
docker-compose up -d
```

## 🎯 Checklist de Déploiement

- [ ] Images Docker poussées sur le registry
- [ ] Variables d'environnement configurées
- [ ] Base de données créée et migrée
- [ ] Ports ouverts dans le firewall
- [ ] SSL configuré (production)
- [ ] Monitoring configuré
- [ ] Sauvegardes automatiques configurées
- [ ] Tests de connectivité effectués

## 📞 Support

En cas de problème :

1. Vérifier les logs : `docker-compose logs -f`
2. Vérifier le statut : `docker-compose ps`
3. Redémarrer les services : `docker-compose restart`
4. Vérifier la connectivité réseau
5. Consulter cette documentation

---

**🎉 Votre application est maintenant prête pour la production !**
