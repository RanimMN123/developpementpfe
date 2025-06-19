# Script PowerShell pour exécuter les migrations Prisma dans Docker
# Usage: .\scripts\docker-migrate.ps1

Write-Host "🗄️ MIGRATION DE LA BASE DE DONNÉES" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier que les conteneurs sont en cours d'exécution
Write-Host "🔍 Vérification des conteneurs..." -ForegroundColor Yellow
$backendStatus = docker compose ps backend --format "{{.State}}"
$postgresStatus = docker compose ps postgres --format "{{.State}}"

if ($backendStatus -ne "running") {
    Write-Host "❌ Le conteneur backend n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "   Démarrez d'abord l'application avec: .\scripts\docker-start.ps1" -ForegroundColor Yellow
    exit 1
}

if ($postgresStatus -ne "running") {
    Write-Host "❌ Le conteneur PostgreSQL n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "   Démarrez d'abord l'application avec: .\scripts\docker-start.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Conteneurs en cours d'exécution" -ForegroundColor Green

# Attendre que PostgreSQL soit prêt
Write-Host "⏳ Attente de PostgreSQL..." -ForegroundColor Yellow
do {
    $pgReady = docker compose exec postgres pg_isready -U postgres -d adminapp 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   PostgreSQL n'est pas encore prêt, attente..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($LASTEXITCODE -ne 0)

Write-Host "✅ PostgreSQL est prêt" -ForegroundColor Green

# Exécuter les migrations Prisma
Write-Host "🔄 Exécution des migrations Prisma..." -ForegroundColor Yellow
docker compose exec backend npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations exécutées avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'exécution des migrations" -ForegroundColor Red
    exit 1
}

# Générer le client Prisma (au cas où)
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Yellow
docker compose exec backend npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Client Prisma généré avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la génération du client Prisma" -ForegroundColor Red
}

# Optionnel: Seed de la base de données
$seed = Read-Host "Voulez-vous exécuter le seed de la base de données ? (O/N)"
if ($seed -eq "O" -or $seed -eq "o" -or $seed -eq "Y" -or $seed -eq "y") {
    Write-Host "🌱 Exécution du seed..." -ForegroundColor Yellow
    docker compose exec backend npx prisma db seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Seed exécuté avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'exécution du seed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 MIGRATION TERMINÉE !" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   • Voir le schéma: docker compose exec backend npx prisma studio" -ForegroundColor White
Write-Host "   • Reset DB: docker compose exec backend npx prisma migrate reset" -ForegroundColor White
Write-Host "   • Logs DB: docker compose logs postgres" -ForegroundColor White
