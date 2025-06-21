# 🔒 Documentation de Sécurité - Backend

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans le backend pour protéger contre les attaques XSS, CSRF, injection SQL, et autres vulnérabilités courantes.

## 🛡️ Protections Implémentées

### 1. Protection XSS (Cross-Site Scripting)

#### Intercepteur XSS Global
- **Fichier**: `src/security/interceptors/xss-protection.interceptor.ts`
- **Fonctionnalités**:
  - Détection automatique des tentatives XSS
  - Sanitisation des données d'entrée
  - Headers de sécurité automatiques
  - Logging des tentatives malveillantes

#### Headers de Sécurité
```
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

### 2. Protection CSRF (Cross-Site Request Forgery)

#### Guard CSRF
- **Fichier**: `src/security/guards/csrf.guard.ts`
- **Fonctionnalités**:
  - Génération automatique de tokens CSRF
  - Validation des tokens pour les requêtes POST/PUT/PATCH/DELETE
  - Gestion des tokens expirés
  - Support des cookies et headers

#### Configuration
- **Expiration**: 1 heure
- **Cookie**: `csrf-token` (accessible en JavaScript)
- **Header**: `X-CSRF-Token`

### 3. Rate Limiting

#### Guard Rate Limit
- **Fichier**: `src/security/guards/rate-limit.guard.ts`
- **Limites par défaut**: 100 requêtes / 15 minutes
- **Limites spécifiques**:
  - `/auth/login`: 5 tentatives / 15 minutes
  - `/users/signup`: 3 créations / 1 heure
  - `/admin/create-admin`: 1 création / 1 heure

### 4. Validation et Sanitisation des Données

#### DTOs Sécurisés
- **Fichier**: `src/security/dto/secure-validation.dto.ts`
- **Validations**:
  - Détection de scripts malveillants
  - Protection contre l'injection SQL
  - Sanitisation automatique des chaînes
  - Validation des formats (email, téléphone, etc.)

#### Décorateurs Personnalisés
- `@IsNotScript()`: Détecte les scripts malveillants
- `@IsNotSqlInjection()`: Détecte les tentatives d'injection SQL
- `@Sanitize()`: Nettoie automatiquement les données

### 5. Sécurité des Uploads de Fichiers

#### Middleware de Sécurité
- **Fichier**: `src/security/middleware/file-upload-security.middleware.ts`
- **Protections**:
  - Validation des types MIME
  - Vérification des signatures de fichiers
  - Limitation de taille (10MB)
  - Détection de contenu malveillant
  - Noms de fichiers sécurisés

### 6. Configuration CORS Sécurisée

#### Origines Autorisées
```javascript
const allowedOrigins = [
  'http://localhost:3001',
  'http://192.168.100.138:8083',
  'http://192.168.100.138:3000',
  // ... autres origines autorisées
];
```

#### Headers Autorisés
- `Origin`, `X-Requested-With`, `Content-Type`
- `Accept`, `Authorization`
- `X-CSRF-Token`, `csrf-token`

### 7. Service de Sécurité Central

#### SecurityService
- **Fichier**: `src/security/security.service.ts`
- **Fonctionnalités**:
  - Sanitisation des chaînes et objets
  - Génération de tokens CSRF
  - Détection XSS et injection SQL
  - Validation des mots de passe
  - Nettoyage des logs

## 🔧 Configuration

### Variables d'Environnement
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d
NODE_ENV=production
```

### Configuration Centralisée
- **Fichier**: `src/security/config/security.config.ts`
- Contient toutes les configurations de sécurité
- Validation automatique de la configuration

## 📊 Tests de Sécurité

### Script de Test
- **Fichier**: `scripts/simple-security-test.js`
- **Tests inclus**:
  - Headers de sécurité
  - Protection XSS
  - Validation des données
  - Rate limiting
  - Protection CORS
  - Sanitisation des entrées

### Exécution des Tests
```bash
cd backend
node scripts/simple-security-test.js
```

## 🚨 Logging de Sécurité

### Événements Loggés
- Tentatives XSS détectées
- Tentatives d'injection SQL
- Dépassements de rate limit
- Tokens CSRF invalides
- Uploads de fichiers suspects

### Format des Logs
```javascript
{
  ip: 'xxx.xxx.xxx.xxx',
  userAgent: 'User-Agent-String',
  path: '/endpoint',
  timestamp: '2025-06-14T14:42:00.000Z',
  type: 'XSS_ATTEMPT',
  details: { ... }
}
```

## 🔄 Maintenance

### Nettoyage Automatique
- **Tokens CSRF expirés**: Toutes les 5 minutes
- **Compteurs Rate Limit**: Toutes les 5 minutes
- **Logs de sécurité**: Toutes les heures

### Surveillance Recommandée
- Surveiller les logs de sécurité
- Vérifier les métriques de rate limiting
- Analyser les tentatives d'attaque
- Mettre à jour les règles de validation

## 🎯 Bonnes Pratiques

### Pour les Développeurs
1. **Toujours utiliser les DTOs sécurisés** pour la validation
2. **Appliquer les guards de sécurité** sur les contrôleurs sensibles
3. **Valider les données côté serveur** même si validées côté client
4. **Logger les événements de sécurité** pour le monitoring
5. **Tester régulièrement** avec le script de sécurité

### Pour la Production
1. **Changer la clé JWT** par défaut
2. **Configurer HTTPS** avec certificats valides
3. **Limiter les origines CORS** aux domaines autorisés
4. **Surveiller les logs** de sécurité en temps réel
5. **Mettre à jour** les dépendances régulièrement

## 📈 Métriques de Sécurité

### Résultats des Tests Actuels
- ✅ **Connectivité**: OK
- ✅ **Headers de sécurité**: OK
- ✅ **Protection XSS**: OK
- ⚠️ **Validation des données**: À améliorer
- ✅ **Rate Limiting**: OK
- ✅ **Protection CORS**: OK
- ⚠️ **Protection données sensibles**: À améliorer
- ✅ **Sanitisation**: OK

### Niveau de Sécurité Global
**75% - BON** (6/8 tests passés)

## 🔗 Ressources

### Documentation NestJS
- [Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Validation](https://docs.nestjs.com/techniques/validation)
- [Guards](https://docs.nestjs.com/guards)

### Outils de Sécurité
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js](https://helmetjs.github.io/)
- [Class Validator](https://github.com/typestack/class-validator)

---

**Dernière mise à jour**: 14 juin 2025  
**Version**: 1.0.0  
**Statut**: ✅ Protections actives
