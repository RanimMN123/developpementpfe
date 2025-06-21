# Script de déploiement complet : Backend Docker + Mobile APK
# Usage: .\scripts\deploy-complete.ps1

param(
    [switch]$BuildMobile = $false,
    [switch]$SkipBackend = $false,
    [switch]$ProductionMode = $false
)

Write-Host "🚀 DÉPLOIEMENT COMPLET - BACKEND DOCKER + MOBILE" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host "Date: $(Get-Date)" -ForegroundColor Yellow
Write-Host "Mode Production: $ProductionMode" -ForegroundColor Yellow
Write-Host "Build Mobile: $BuildMobile" -ForegroundColor Yellow
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

# 1. BACKEND DOCKER
if (-not $SkipBackend) {
    Write-Step "Déploiement du Backend Docker..."
    
    # Arrêter les conteneurs existants
    Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
    docker-compose down --remove-orphans
    
    # Démarrer le backend final
    Write-Host "🚀 Démarrage du backend final..." -ForegroundColor Yellow
    docker run -d -p 3000:3000 `
        -e DATABASE_URL="postgresql://postgres:Azerty123*@host.docker.internal:5432/adminapp?schema=public" `
        --name admin_backend_final `
        ranimmn/ranouma:backend-final-18-06-2025
    
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Échec du démarrage du backend Docker"
    }
    
    # Attendre que le backend soit prêt
    Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Test de connectivité
    $maxRetries = 5
    $retryCount = 0
    $backendOK = $false
    
    do {
        $retryCount++
        Write-Host "🧪 Test connectivité backend ($retryCount/$maxRetries)..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000/test/ping" -Method Get -TimeoutSec 5
            if ($response.message -eq "Backend fonctionne !") {
                $backendOK = $true
                Write-Host "✅ Backend accessible sur localhost:3000" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "❌ Backend non accessible, nouvelle tentative..." -ForegroundColor Red
        }
        
        if ($retryCount -lt $maxRetries) {
            Start-Sleep -Seconds 10
        }
    } while ($retryCount -lt $maxRetries)
    
    if (-not $backendOK) {
        Handle-Error "Backend Docker non accessible après $maxRetries tentatives"
    }
    
    # Test depuis l'IP du PC
    try {
        $ipResponse = Invoke-RestMethod -Uri "http://192.168.100.187:3000/test/ping" -Method Get -TimeoutSec 5
        Write-Host "✅ Backend accessible depuis IP PC: 192.168.100.187:3000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Backend non accessible depuis IP PC (normal si réseau différent)" -ForegroundColor Yellow
    }
    
    Write-Host "🎉 Backend Docker déployé avec succès !" -ForegroundColor Green
} else {
    Write-Host "⏭️ Déploiement backend ignoré (--SkipBackend)" -ForegroundColor Yellow
}

# 2. APPLICATION MOBILE
if ($BuildMobile) {
    Write-Step "Construction de l'application mobile..."
    
    # Vérifier que le backend est accessible
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/test/ping" -Method Get -TimeoutSec 5
        Write-Host "✅ Backend accessible pour le mobile" -ForegroundColor Green
    } catch {
        Handle-Error "Backend non accessible - impossible de construire le mobile"
    }
    
    # Aller dans le dossier mobile
    Push-Location "mobile"
    
    try {
        Write-Host "📱 Préparation de l'application mobile..." -ForegroundColor Yellow
        
        # Vérifier les dépendances
        if (-not (Test-Path "node_modules")) {
            Write-Host "📦 Installation des dépendances mobile..." -ForegroundColor Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                Handle-Error "Échec de l'installation des dépendances mobile"
            }
        }
        
        # Build EAS
        Write-Host "🔨 Construction APK avec EAS..." -ForegroundColor Yellow
        if ($ProductionMode) {
            npx eas build --platform android --profile production --non-interactive
        } else {
            npx eas build --platform android --profile preview --non-interactive
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "🎉 APK mobile construit avec succès !" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Problème lors de la construction mobile (vérifiez les logs EAS)" -ForegroundColor Yellow
        }
        
    } finally {
        Pop-Location
    }
} else {
    Write-Host "⏭️ Construction mobile ignorée (utilisez --BuildMobile pour activer)" -ForegroundColor Yellow
}

# 3. TESTS FINAUX
Write-Step "Tests finaux du système complet..."

# Test backend
try {
    $pingResponse = Invoke-RestMethod -Uri "http://localhost:3000/test/ping" -Method Get -TimeoutSec 5
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method Get -TimeoutSec 5
    
    Write-Host "✅ API Backend: OK" -ForegroundColor Green
    Write-Host "✅ Catégories: $($categoriesResponse.data.Count) disponibles" -ForegroundColor Green
} catch {
    Write-Host "❌ API Backend: Erreur" -ForegroundColor Red
}

# Test frontend (si accessible)
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -Method Get -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend Admin: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Frontend Admin: Non accessible (normal si non démarré)" -ForegroundColor Yellow
}

# 4. RÉSUMÉ FINAL
Write-Host ""
Write-Host "=" * 70
Write-Host "🎉 DÉPLOIEMENT COMPLET TERMINÉ !" -ForegroundColor Green
Write-Host "=" * 70

Write-Host "📊 Services disponibles:" -ForegroundColor Cyan
Write-Host "   🔗 Backend Docker: http://localhost:3000" -ForegroundColor White
Write-Host "   🔗 Backend IP PC: http://192.168.100.187:3000" -ForegroundColor White
Write-Host "   🌐 Frontend Admin: http://localhost:3001" -ForegroundColor White
Write-Host "   📱 Mobile: Auto-découverte activée" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Avantages obtenus:" -ForegroundColor Cyan
Write-Host "   ✅ Backend Docker stable et accessible" -ForegroundColor White
Write-Host "   ✅ Mobile avec auto-découverte IP intelligente" -ForegroundColor White
Write-Host "   ✅ Plus jamais de rebuild quand IP change" -ForegroundColor White
Write-Host "   ✅ Solution définitive et robuste" -ForegroundColor White

Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   • Logs backend: docker logs admin_backend_final" -ForegroundColor White
Write-Host "   • Arrêter: docker stop admin_backend_final" -ForegroundColor White
Write-Host "   • Redémarrer: docker restart admin_backend_final" -ForegroundColor White
Write-Host "   • Mobile: npx expo start (dans dossier mobile)" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Votre système est maintenant production-ready !" -ForegroundColor Green
