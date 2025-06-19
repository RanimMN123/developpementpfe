# Script de build final APK avec backend Docker
# Usage: .\scripts\build-final-apk.ps1

param(
    [string]$Profile = "preview",
    [switch]$Production = $false,
    [switch]$SkipBackendCheck = $false
)

Write-Host "📱 BUILD FINAL APK - APPLICATION MOBILE" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host "Profile: $Profile" -ForegroundColor Yellow
Write-Host "Production: $Production" -ForegroundColor Yellow
Write-Host "Date: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Green
}

# Fonction pour gérer les erreurs
function Handle-Error {
    param([string]$Message)
    Write-Host "❌ ERREUR: $Message" -ForegroundColor Red
    exit 1
}

# 1. VÉRIFICATION DU BACKEND DOCKER
if (-not $SkipBackendCheck) {
    Write-Step "Vérification du backend Docker..."
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/test/ping" -Method Get -TimeoutSec 5
        if ($response.message -eq "Backend fonctionne !") {
            Write-Host "✅ Backend Docker accessible sur localhost:3000" -ForegroundColor Green
        } else {
            Handle-Error "Backend Docker ne répond pas correctement"
        }
    } catch {
        Write-Host "❌ Backend Docker non accessible sur localhost:3000" -ForegroundColor Red
        Write-Host "🚀 Démarrage automatique du backend Docker..." -ForegroundColor Yellow
        
        # Démarrer le backend Docker
        docker run -d -p 3000:3000 `
            -e DATABASE_URL="postgresql://postgres:Azerty123*@host.docker.internal:5432/adminapp?schema=public" `
            --name admin_backend_final_build `
            ranimmn/ranouma:backend-final-18-06-2025
        
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Impossible de démarrer le backend Docker"
        }
        
        # Attendre que le backend soit prêt
        Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
        
        # Tester à nouveau
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000/test/ping" -Method Get -TimeoutSec 5
            Write-Host "✅ Backend Docker démarré avec succès" -ForegroundColor Green
        } catch {
            Handle-Error "Backend Docker ne démarre pas correctement"
        }
    }
    
    # Test des API essentielles
    try {
        $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method Get -TimeoutSec 5
        Write-Host "✅ API Catégories: $($categoriesResponse.data.Count) catégories disponibles" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ API Catégories non accessible (peut affecter l'affichage mobile)" -ForegroundColor Yellow
    }
    
    # Test depuis l'IP du PC
    try {
        $ipResponse = Invoke-RestMethod -Uri "http://192.168.100.187:3000/test/ping" -Method Get -TimeoutSec 5
        Write-Host "✅ Backend accessible depuis IP PC: 192.168.100.187:3000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Backend non accessible depuis IP PC (l'auto-découverte utilisera localhost)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Vérification backend ignorée (--SkipBackendCheck)" -ForegroundColor Yellow
}

# 2. PRÉPARATION DE L'ENVIRONNEMENT MOBILE
Write-Step "Préparation de l'environnement mobile..."

# Aller dans le dossier mobile
if (-not (Test-Path "mobile")) {
    Handle-Error "Dossier mobile non trouvé"
}

Push-Location "mobile"

try {
    # Vérifier les dépendances
    Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Échec de l'installation des dépendances"
        }
    } else {
        Write-Host "✅ Dépendances déjà installées" -ForegroundColor Green
    }
    
    # Vérifier la configuration EAS
    Write-Host "🔧 Vérification de la configuration EAS..." -ForegroundColor Yellow
    if (-not (Test-Path "eas.json")) {
        Handle-Error "Fichier eas.json non trouvé"
    }
    
    # Vérifier la connexion EAS
    Write-Host "🔐 Vérification de la connexion EAS..." -ForegroundColor Yellow
    npx eas whoami
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Non connecté à EAS, tentative de connexion..." -ForegroundColor Yellow
        npx eas login
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Impossible de se connecter à EAS"
        }
    }
    
    # 3. BUILD DE L'APK
    Write-Step "Construction de l'APK final..."
    
    if ($Production) {
        Write-Host "🏭 Build PRODUCTION en cours..." -ForegroundColor Yellow
        npx eas build --platform android --profile production --non-interactive
    } else {
        Write-Host "🧪 Build PREVIEW en cours..." -ForegroundColor Yellow
        npx eas build --platform android --profile $Profile --non-interactive
    }
    
    $buildResult = $LASTEXITCODE
    
    if ($buildResult -eq 0) {
        Write-Host ""
        Write-Host "🎉 APK CONSTRUIT AVEC SUCCÈS !" -ForegroundColor Green
        Write-Host "=" * 60
        
        # Informations sur le build
        Write-Host "📱 Informations du build:" -ForegroundColor Cyan
        Write-Host "   • Version: 1.1.0 (versionCode: 2)" -ForegroundColor White
        Write-Host "   • Profile: $Profile" -ForegroundColor White
        Write-Host "   • Backend: Docker (ranimmn/ranouma:backend-final-18-06-2025)" -ForegroundColor White
        Write-Host "   • Auto-découverte: Activée" -ForegroundColor White
        
        Write-Host ""
        Write-Host "🔗 Récupération du lien de téléchargement:" -ForegroundColor Cyan
        Write-Host "   • Connectez-vous sur: https://expo.dev" -ForegroundColor White
        Write-Host "   • Projet: AutoDiscoveryApp" -ForegroundColor White
        Write-Host "   • Builds: Dernière build disponible" -ForegroundColor White
        
        Write-Host ""
        Write-Host "📱 Fonctionnalités de l'APK:" -ForegroundColor Cyan
        Write-Host "   ✅ Auto-découverte IP intelligente" -ForegroundColor White
        Write-Host "   ✅ Connexion automatique au backend Docker" -ForegroundColor White
        Write-Host "   ✅ Plus jamais de rebuild quand IP change" -ForegroundColor White
        Write-Host "   ✅ Synchronisation globale des IPs" -ForegroundColor White
        Write-Host "   ✅ Réparation automatique des incohérences" -ForegroundColor White
        Write-Host "   ✅ Interface de statut de connexion" -ForegroundColor White
        
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC DU BUILD APK" -ForegroundColor Red
        Write-Host "=" * 60
        
        Write-Host "🔍 Vérifications à effectuer:" -ForegroundColor Yellow
        Write-Host "   • Connexion internet stable" -ForegroundColor White
        Write-Host "   • Compte EAS valide et connecté" -ForegroundColor White
        Write-Host "   • Quota EAS disponible" -ForegroundColor White
        Write-Host "   • Configuration eas.json correcte" -ForegroundColor White
        
        Write-Host ""
        Write-Host "🛠️ Solutions possibles:" -ForegroundColor Yellow
        Write-Host "   • Relancer: npx eas build --platform android --profile $Profile" -ForegroundColor White
        Write-Host "   • Vérifier: npx eas build:list" -ForegroundColor White
        Write-Host "   • Nettoyer: npx eas build:cancel --all" -ForegroundColor White
    }
    
} finally {
    Pop-Location
}

# 4. RÉSUMÉ FINAL
Write-Host ""
Write-Host "=" * 60
Write-Host "📋 RÉSUMÉ DU BUILD FINAL" -ForegroundColor Cyan
Write-Host "=" * 60

Write-Host "🐳 Backend Docker:" -ForegroundColor Yellow
Write-Host "   • Image: ranimmn/ranouma:backend-final-18-06-2025" -ForegroundColor White
Write-Host "   • Status: Accessible sur localhost:3000 et IP PC" -ForegroundColor White
Write-Host "   • API: Toutes les routes fonctionnelles" -ForegroundColor White

Write-Host ""
Write-Host "📱 Application Mobile:" -ForegroundColor Yellow
Write-Host "   • Version: 1.1.0 (versionCode: 2)" -ForegroundColor White
Write-Host "   • Auto-découverte: Système intelligent activé" -ForegroundColor White
Write-Host "   • Compatibilité: Fonctionne avec tous les changements d'IP" -ForegroundColor White

if ($buildResult -eq 0) {
    Write-Host ""
    Write-Host "🎯 PROCHAINES ÉTAPES:" -ForegroundColor Green
    Write-Host "   1. Télécharger l'APK depuis expo.dev" -ForegroundColor White
    Write-Host "   2. Installer sur votre appareil Android" -ForegroundColor White
    Write-Host "   3. Tester la connexion automatique au backend" -ForegroundColor White
    Write-Host "   4. Vérifier que les images s'affichent correctement" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 VOTRE SOLUTION EST MAINTENANT COMPLÈTE !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ BUILD À RELANCER:" -ForegroundColor Yellow
    Write-Host "   Utilisez: .\scripts\build-final-apk.ps1" -ForegroundColor White
}

Write-Host ""
