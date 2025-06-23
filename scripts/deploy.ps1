# Script de déploiement automatisé pour l'application Admin
# Usage: .\scripts\deploy.ps1

param(
    [string]$Environment = "development",
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [switch]$Force = $false
)

Write-Host "🚀 DÉPLOIEMENT APPLICATION ADMIN" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host "Environnement: $Environment" -ForegroundColor Yellow
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

# Vérifier les prérequis
Write-Step "Vérification des prérequis..."

try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Handle-Error "Docker n'est pas installé ou accessible"
}

try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Handle-Error "Docker Compose n'est pas disponible"
}

# Arrêter les services existants
Write-Step "Arrêt des services existants..."
docker-compose down --remove-orphans
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Aucun service à arrêter ou erreur mineure" -ForegroundColor Yellow
}

# Nettoyer si demandé
if ($Force) {
    Write-Step "Nettoyage forcé des ressources Docker..."
    docker system prune -f
    docker volume prune -f
}

# Construire les images si nécessaire
if (-not $SkipBuild) {
    Write-Step "Construction des images Docker..."
    
    # Backend
    Write-Host "🔨 Construction du backend..." -ForegroundColor Yellow
    docker build -t ranimmn/ranouma:backend-latest ./backend
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Échec de la construction du backend"
    }
    
    Write-Host "✅ Backend construit avec succès" -ForegroundColor Green
} else {
    Write-Host "⏭️ Construction ignorée (--SkipBuild)" -ForegroundColor Yellow
}

# Tests (si activés)
if (-not $SkipTests) {
    Write-Step "Exécution des tests..."
    
    # Test de connectivité des images
    Write-Host "🧪 Test des images Docker..." -ForegroundColor Yellow
    
    $testBackend = docker run --rm --entrypoint sh ranimmn/ranouma:backend-latest -c "node --version"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Image backend valide" -ForegroundColor Green
    } else {
        Handle-Error "Image backend invalide"
    }
} else {
    Write-Host "⏭️ Tests ignorés (--SkipTests)" -ForegroundColor Yellow
}

# Configuration de l'environnement
Write-Step "Configuration de l'environnement $Environment..."

$envFile = ".env.$Environment"
if (Test-Path $envFile) {
    Write-Host "✅ Fichier d'environnement trouvé: $envFile" -ForegroundColor Green
    Copy-Item $envFile ".env" -Force
} else {
    Write-Host "⚠️ Aucun fichier d'environnement spécifique, utilisation des valeurs par défaut" -ForegroundColor Yellow
}

# Démarrage des services
Write-Step "Démarrage des services..."

docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Handle-Error "Échec du démarrage des services"
}

# Attendre que les services soient prêts
Write-Step "Attente du démarrage des services..."
Start-Sleep -Seconds 15

# Vérification de la santé des services
Write-Step "Vérification de la santé des services..."

$maxRetries = 10
$retryCount = 0

do {
    $retryCount++
    Write-Host "Tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
    
    try {
        # Test backend
        $backendResponse = Invoke-RestMethod -Uri "http://localhost:3000/test/ping" -Method Get -TimeoutSec 5
        $backendOK = $true
        Write-Host "✅ Backend: OK" -ForegroundColor Green
    } catch {
        $backendOK = $false
        Write-Host "❌ Backend: Non accessible" -ForegroundColor Red
    }
    
    try {
        # Test frontend
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -Method Get -TimeoutSec 5
        $frontendOK = $frontendResponse.StatusCode -eq 200
        Write-Host "✅ Frontend: OK" -ForegroundColor Green
    } catch {
        $frontendOK = $false
        Write-Host "❌ Frontend: Non accessible" -ForegroundColor Red
    }
    
    if ($backendOK -and $frontendOK) {
        break
    }
    
    if ($retryCount -lt $maxRetries) {
        Write-Host "⏳ Attente de 10 secondes avant nouvelle tentative..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
} while ($retryCount -lt $maxRetries)

# Résultats finaux
Write-Host ""
Write-Host "=" * 60
if ($backendOK -and $frontendOK) {
    Write-Host "🎉 DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
    Write-Host "=" * 60
    Write-Host "📊 Services disponibles:" -ForegroundColor Cyan
    Write-Host "   🔗 Backend API: http://localhost:3000" -ForegroundColor White
    Write-Host "   🌐 Frontend Admin: http://localhost:3001" -ForegroundColor White
    Write-Host "   📱 Mobile: Auto-découverte activée" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
    Write-Host "   • Logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   • Statut: docker-compose ps" -ForegroundColor White
    Write-Host "   • Arrêter: docker-compose down" -ForegroundColor White
    Write-Host "   • Redémarrer: docker-compose restart" -ForegroundColor White
} else {
    Write-Host "❌ DÉPLOIEMENT ÉCHOUÉ" -ForegroundColor Red
    Write-Host "=" * 60
    Write-Host "📋 Diagnostic:" -ForegroundColor Yellow
    Write-Host "   • Vérifiez les logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   • Vérifiez le statut: docker-compose ps" -ForegroundColor White
    Write-Host "   • Redémarrez: docker-compose restart" -ForegroundColor White
    
    # Afficher les logs en cas d'erreur
    Write-Host ""
    Write-Host "📋 Logs récents:" -ForegroundColor Yellow
    docker-compose logs --tail=20
    
    exit 1
}

Write-Host ""
Write-Host "✅ Déploiement terminé avec succès !" -ForegroundColor Green
