# Test simple des Dockerfiles
param([switch]$TestOnly = $true)

Write-Host "Test des Dockerfiles pour deploiement gratuit..." -ForegroundColor Blue

# Test Backend Dockerfile
Write-Host "Test du Dockerfile backend..." -ForegroundColor Yellow
try {
    docker build -t ranouma-backend-test -f backend/Dockerfile.railway backend/
    Write-Host "SUCCESS: Dockerfile backend valide" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Dockerfile backend invalide" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Test Frontend Dockerfile
Write-Host "Test du Dockerfile frontend..." -ForegroundColor Yellow
try {
    docker build -t ranouma-frontend-test -f frontend-admin/Dockerfile.railway frontend-admin/
    Write-Host "SUCCESS: Dockerfile frontend valide" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Dockerfile frontend invalide" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "TOUS LES TESTS PASSES!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Blue
Write-Host "1. Railway: Connecter GitHub repo sur railway.app"
Write-Host "2. Render: Push vers GitHub avec render.yaml"
Write-Host "3. Fly.io: flyctl launch dans chaque dossier"
Write-Host "4. CI/CD: Configurer secrets GitHub et push vers main"

# Nettoyage
Write-Host "Nettoyage des images de test..." -ForegroundColor Yellow
docker rmi ranouma-backend-test ranouma-frontend-test 2>$null
