# ⚡ COMMANDES RAPIDES - SOLUTION FINALE

## 🚀 **DÉMARRAGE RAPIDE**

### **1. Démarrer le backend Docker final**
```bash
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:Azerty123*@host.docker.internal:5432/adminapp?schema=public" \
  --name admin_backend_final \
  ranimmn/ranouma:backend-final-18-06-2025
```

### **2. Démarrer l'application mobile**
```bash
cd mobile
npx expo start
```

### **3. Builder l'APK final**
```bash
cd mobile
npx eas build --platform android --profile preview
```

---

## 🐳 **GESTION DOCKER**

### **Backend**
```bash
# Démarrer
docker start admin_backend_final

# Arrêter
docker stop admin_backend_final

# Redémarrer
docker restart admin_backend_final

# Logs
docker logs admin_backend_final

# Logs en temps réel
docker logs -f admin_backend_final

# Supprimer
docker rm admin_backend_final
```

### **Images**
```bash
# Lister les images
docker images ranimmn/ranouma

# Télécharger la dernière
docker pull ranimmn/ranouma:backend-final-18-06-2025

# Nettoyer
docker system prune
```

---

## 🧪 **TESTS RAPIDES**

### **Backend**
```bash
# Test ping
curl http://localhost:3000/test/ping

# Test depuis IP PC
curl http://192.168.100.187:3000/test/ping

# Test catégories
curl http://localhost:3000/categories

# Test image
curl -I http://localhost:3000/public/images/image-1748895816150-207160491.png
```

### **Mobile**
```bash
# Dans le dossier mobile
cd mobile

# Démarrer Expo
npx expo start

# Build preview
npx eas build --platform android --profile preview

# Build production
npx eas build --platform android --profile production

# Vérifier les builds
npx eas build:list
```

---

## 🔧 **DÉPANNAGE**

### **Backend ne démarre pas**
```bash
# Vérifier les conteneurs
docker ps -a

# Vérifier les logs
docker logs admin_backend_final

# Redémarrer proprement
docker stop admin_backend_final
docker rm admin_backend_final
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:Azerty123*@host.docker.internal:5432/adminapp?schema=public" \
  --name admin_backend_final \
  ranimmn/ranouma:backend-final-18-06-2025
```

### **Mobile ne se connecte pas**
```bash
# Vérifier le backend
curl http://localhost:3000/test/ping

# Redémarrer Expo
cd mobile
npx expo start --clear

# Vérifier l'IP du PC
ipconfig
```

### **Build EAS échoue**
```bash
# Vérifier la connexion
npx eas whoami

# Se reconnecter
npx eas login

# Annuler les builds en cours
npx eas build:cancel --all

# Relancer le build
npx eas build --platform android --profile preview
```

---

## 📊 **MONITORING**

### **Statut des services**
```bash
# Docker
docker ps
docker stats

# Réseau
netstat -an | findstr :3000
ping 192.168.100.187

# Base de données
# Vérifiez dans les logs Docker si "Prisma connected"
```

### **Logs utiles**
```bash
# Backend Docker
docker logs admin_backend_final | tail -20

# Mobile (dans le terminal Expo)
# Recherchez les messages avec ✅ ou ❌

# Système
# Vérifiez l'utilisation CPU/RAM avec docker stats
```

---

## 🔄 **MISE À JOUR**

### **Nouvelle version backend**
```bash
# Arrêter l'ancien
docker stop admin_backend_final
docker rm admin_backend_final

# Télécharger la nouvelle image
docker pull ranimmn/ranouma:backend-final-18-06-2025

# Redémarrer avec la nouvelle
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:Azerty123*@host.docker.internal:5432/adminapp?schema=public" \
  --name admin_backend_final \
  ranimmn/ranouma:backend-final-18-06-2025
```

### **Nouvelle version mobile**
```bash
cd mobile

# Mettre à jour les dépendances
npm update

# Incrémenter la version dans app.json
# version: "1.2.0", versionCode: 3

# Builder la nouvelle APK
npx eas build --platform android --profile preview
```

---

## 🎯 **SCRIPTS AUTOMATISÉS**

### **Déploiement complet**
```bash
.\scripts\deploy-complete.ps1
```

### **Build APK final**
```bash
.\scripts\build-final-apk.ps1
```

### **Tests automatiques**
```bash
# Suivez le guide TESTING_GUIDE.md
```

---

## 📱 **UTILISATION QUOTIDIENNE**

### **Démarrage journalier**
1. **Démarrer le backend :** `docker start admin_backend_final`
2. **Vérifier :** `curl http://localhost:3000/test/ping`
3. **Démarrer mobile :** `cd mobile && npx expo start`

### **Arrêt propre**
1. **Arrêter mobile :** `Ctrl+C` dans le terminal Expo
2. **Arrêter backend :** `docker stop admin_backend_final`

### **En cas de changement d'IP**
1. **Rien à faire !** 🎉
2. L'auto-découverte mobile trouve automatiquement la nouvelle IP
3. Le backend Docker reste accessible

---

## 🆘 **AIDE RAPIDE**

### **Problèmes courants**

| Problème | Solution |
|----------|----------|
| Backend inaccessible | `docker restart admin_backend_final` |
| Mobile erreurs réseau | Vérifier `curl http://localhost:3000/test/ping` |
| Build EAS échoue | `npx eas login` puis relancer |
| Images ne s'affichent pas | Vérifier les logs Docker |
| IP change | Rien à faire, auto-découverte active |

### **Contacts utiles**
- **Docker Hub :** https://hub.docker.com/r/ranimmn/ranouma
- **Expo :** https://expo.dev
- **Documentation :** Voir DEPLOYMENT_GUIDE.md

---

## 🎉 **RÉSUMÉ**

**Votre solution est maintenant :**
- ✅ **Automatique** - Plus de configuration manuelle
- ✅ **Robuste** - Résiste aux changements d'IP
- ✅ **Simple** - Quelques commandes suffisent
- ✅ **Production-ready** - Déployable partout

**🚀 Utilisez ces commandes pour gérer votre application au quotidien !**
