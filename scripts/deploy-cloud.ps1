# Script de déploiement cloud PowerShell
param(
    [string]$Environment = "staging",
    [switch]$ShowLogs = $false
)

# Couleurs pour les logs
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
    exit 1
}

# Variables
$Version = Get-Date -Format "yyyyMMdd-HHmmss"
$DockerRegistry = "ranimmn"
$ProjectName = "ranouma"

Write-Log "🚀 Démarrage du déploiement cloud" $Blue
Write-Log "📋 Environnement: $Environment" $Blue
Write-Log "🏷️ Version: $Version" $Blue

# Vérification des prérequis
Write-Log "🔍 Vérification des prérequis..." $Blue

try {
    docker --version | Out-Null
    Write-Success "Docker installé"
} catch {
    Write-Error "Docker n'est pas installé ou accessible"
}

try {
    docker-compose --version | Out-Null
    Write-Success "Docker Compose installé"
} catch {
    Write-Error "Docker Compose n'est pas installé ou accessible"
}

Write-Success "Prérequis validés"

# Construction des images
Write-Log "🏗️ Construction des images Docker..." $Blue

# Backend
Write-Log "📦 Construction de l'image backend..." $Blue
docker build -t "$DockerRegistry/$ProjectName`:backend-$Version" -f backend/Dockerfile.prod backend/
if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec de la construction de l'image backend"
}

docker tag "$DockerRegistry/$ProjectName`:backend-$Version" "$DockerRegistry/$ProjectName`:backend-latest"

# Frontend
Write-Log "🌐 Construction de l'image frontend..." $Blue
docker build -t "$DockerRegistry/$ProjectName`:frontend-$Version" -f frontend-admin/Dockerfile.prod frontend-admin/
if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec de la construction de l'image frontend"
}

docker tag "$DockerRegistry/$ProjectName`:frontend-$Version" "$DockerRegistry/$ProjectName`:frontend-latest"

Write-Success "Images construites avec succès"

# Push vers le registry
if ($Environment -eq "production") {
    Write-Log "Push des images vers le registry..." $Blue

    docker push "$DockerRegistry/$ProjectName`:backend-$Version"
    docker push "$DockerRegistry/$ProjectName`:backend-latest"
    docker push "$DockerRegistry/$ProjectName`:frontend-$Version"
    docker push "$DockerRegistry/$ProjectName`:frontend-latest"

    Write-Success "Images pushees vers le registry"
} else {
    Write-Warning "Mode staging - images non pushees"
}

# Deploiement
Write-Log "Deploiement de l'application..." $Blue

# Arrêter les conteneurs existants
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Variables d'environnement
$env:BUILD_VERSION = $Version
$env:DOCKER_REGISTRY = $DockerRegistry

# Démarrer les nouveaux conteneurs
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prets
Write-Log "Attente du demarrage des services..." $Blue
Start-Sleep -Seconds 30

# Health checks
Write-Log "Verification de la sante des services..." $Blue

# Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend opérationnel"
    } else {
        Write-Error "Backend retourne le code: $($response.StatusCode)"
    }
} catch {
    Write-Error "Backend non accessible: $($_.Exception.Message)"
}

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Frontend opérationnel"
    } else {
        Write-Error "Frontend retourne le code: $($response.StatusCode)"
    }
} catch {
    Write-Error "Frontend non accessible: $($_.Exception.Message)"
}

# Nettoyage des anciennes images
Write-Log "Nettoyage des anciennes images..." $Blue
docker image prune -f

# Résumé du déploiement
Write-Log "📊 Résumé du déploiement:" $Blue
Write-Host "  🌍 Environnement: $Environment"
Write-Host "  🏷️ Version: $Version"
Write-Host "  🐳 Images déployées:"
Write-Host "    - Backend: $DockerRegistry/$ProjectName`:backend-$Version"
Write-Host "    - Frontend: $DockerRegistry/$ProjectName`:frontend-$Version"
Write-Host "  🌐 URLs:"
Write-Host "    - Backend: http://localhost:3000"
Write-Host "    - Frontend: http://localhost:3001"

Write-Success "🎉 Déploiement terminé avec succès!"

# Afficher les logs en temps réel (optionnel)
if ($ShowLogs) {
    Write-Log "📋 Affichage des logs en temps réel..." $Blue
    docker-compose -f docker-compose.prod.yml logs -f
}
