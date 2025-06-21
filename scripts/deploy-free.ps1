# Script de test pour déploiement gratuit
param(
    [string]$Platform = "railway",
    [switch]$TestOnly = $false
)

$Green = "Green"
$Blue = "Blue"
$Yellow = "Yellow"
$Red = "Red"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

Write-Log "🆓 Test de déploiement gratuit - Plateforme: $Platform" $Blue

# Test des Dockerfiles
Write-Log "🐳 Test des Dockerfiles..." $Blue

# Test Backend
Write-Log "📦 Test du Dockerfile backend..." $Blue
try {
    docker build -t ranouma-backend-test -f backend/Dockerfile.railway backend/ --no-cache
    Write-Success "Dockerfile backend valide"
} catch {
    Write-Host "❌ Erreur dans le Dockerfile backend: $($_.Exception.Message)" -ForegroundColor $Red
    exit 1
}

# Test Frontend
Write-Log "🌐 Test du Dockerfile frontend..." $Blue
try {
    docker build -t ranouma-frontend-test -f frontend-admin/Dockerfile.railway frontend-admin/ --no-cache
    Write-Success "Dockerfile frontend valide"
} catch {
    Write-Host "❌ Erreur dans le Dockerfile frontend: $($_.Exception.Message)" -ForegroundColor $Red
    exit 1
}

if ($TestOnly) {
    Write-Success "🎉 Tests terminés avec succès!"
    Write-Log "Les Dockerfiles sont prêts pour le déploiement sur $Platform" $Blue
    exit 0
}

# Test local des conteneurs
Write-Log "🚀 Test local des conteneurs..." $Blue

# Variables d'environnement de test
$env:NODE_ENV = "production"
$env:JWT_SECRET = "test-jwt-secret-for-local-testing"
$env:DATABASE_URL = "postgresql://postgres:test123@localhost:5432/adminapp"

# Démarrer PostgreSQL local pour test
Write-Log "🗄️ Démarrage de PostgreSQL de test..." $Blue
docker run -d --name postgres-test -e POSTGRES_PASSWORD=test123 -e POSTGRES_DB=adminapp -p 5432:5432 postgres:15-alpine

Start-Sleep -Seconds 10

# Test du backend
Write-Log "🔧 Test du backend..." $Blue
docker run -d --name backend-test -p 3000:3000 --link postgres-test:postgres -e DATABASE_URL="postgresql://postgres:test123@postgres:5432/adminapp" -e JWT_SECRET="test-jwt-secret" ranouma-backend-test

Start-Sleep -Seconds 15

# Health check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend fonctionne localement"
    }
} catch {
    Write-Host "⚠️ Backend non accessible localement" -ForegroundColor $Yellow
}

# Test du frontend
Write-Log "🌐 Test du frontend..." $Blue
docker run -d --name frontend-test -p 3001:3001 -e VITE_API_URL="http://localhost:3000" ranouma-frontend-test

Start-Sleep -Seconds 10

# Health check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Frontend fonctionne localement"
    }
} catch {
    Write-Host "⚠️ Frontend non accessible localement" -ForegroundColor $Yellow
}

# Nettoyage
Write-Log "🧹 Nettoyage des conteneurs de test..." $Blue
docker stop backend-test frontend-test postgres-test 2>$null
docker rm backend-test frontend-test postgres-test 2>$null
docker rmi ranouma-backend-test ranouma-frontend-test 2>$null

Write-Success "🎉 Tests de déploiement terminés!"

# Instructions pour le déploiement réel
Write-Log "📋 Instructions pour le déploiement réel:" $Blue
Write-Host ""
Write-Host "1. 🚂 Railway:" -ForegroundColor $Blue
Write-Host "   - Aller sur railway.app"
Write-Host "   - Connecter votre repo GitHub"
Write-Host "   - Créer un nouveau projet"
Write-Host "   - Les Dockerfiles seront utilisés automatiquement"
Write-Host ""
Write-Host "2. 🎨 Render:" -ForegroundColor $Blue
Write-Host "   - Aller sur render.com"
Write-Host "   - Connecter votre repo GitHub"
Write-Host "   - Le fichier render.yaml sera utilisé automatiquement"
Write-Host ""
Write-Host "3. 🪰 Fly.io:" -ForegroundColor $Blue
Write-Host "   - Installer flyctl"
Write-Host "   - flyctl auth login"
Write-Host "   - cd backend && flyctl launch"
Write-Host "   - cd frontend-admin && flyctl launch"
Write-Host ""
Write-Host "4. 🔄 CI/CD GitHub Actions:" -ForegroundColor $Blue
Write-Host "   - Configurer les secrets GitHub"
Write-Host "   - Push vers main déclenche le déploiement automatique"
