# Script PowerShell pour démarrer l'application avec Docker
# Usage: .\scripts\docker-start.ps1

Write-Host "🐳 DÉMARRAGE DE L'APPLICATION AVEC DOCKER" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier que Docker est installé et en cours d'exécution
Write-Host "🔍 Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker détecté: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé ou n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "   Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Vérifier que Docker Compose est disponible
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose détecté: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose n'est pas disponible" -ForegroundColor Red
    exit 1
}

# Arrêter les conteneurs existants s'ils existent
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker compose down --remove-orphans

# Nettoyer les images non utilisées (optionnel)
$cleanup = Read-Host "Voulez-vous nettoyer les images Docker non utilisées ? (O/N)"
if ($cleanup -eq "O" -or $cleanup -eq "o" -or $cleanup -eq "Y" -or $cleanup -eq "y") {
    Write-Host "🧹 Nettoyage des images non utilisées..." -ForegroundColor Yellow
    docker system prune -f
}

# Construire et démarrer les services
Write-Host "🏗️ Construction et démarrage des services..." -ForegroundColor Yellow
docker compose up --build -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut des services
Write-Host "📊 Statut des services:" -ForegroundColor Cyan
docker compose ps

# Afficher les logs en temps réel (optionnel)
$showLogs = Read-Host "Voulez-vous afficher les logs en temps réel ? (O/N)"
if ($showLogs -eq "O" -or $showLogs -eq "o" -or $showLogs -eq "Y" -or $showLogs -eq "y") {
    Write-Host "📋 Affichage des logs (Ctrl+C pour arrêter)..." -ForegroundColor Yellow
    docker compose logs -f
} else {
    Write-Host ""
    Write-Host "🎉 APPLICATION DÉMARRÉE AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host "=" * 60
    Write-Host "📱 Backend API: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🌐 Frontend Admin: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "🗄️ Base de données: localhost:5432" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
    Write-Host "   • Voir les logs: docker compose logs -f" -ForegroundColor White
    Write-Host "   • Arrêter: docker compose down" -ForegroundColor White
    Write-Host "   • Redémarrer: docker compose restart" -ForegroundColor White
    Write-Host "   • Statut: docker compose ps" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Pour l'application mobile:" -ForegroundColor Yellow
    Write-Host "   • L'IP du backend est maintenant: localhost:3000" -ForegroundColor White
    Write-Host "   • Ou utilisez l'IP de votre PC: $(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*'} | Select-Object -First 1 -ExpandProperty IPAddress):3000" -ForegroundColor White
}
