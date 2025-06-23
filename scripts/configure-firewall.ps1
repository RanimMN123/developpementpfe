# Script PowerShell pour configurer le firewall Windows pour l'application mobile
# Exécuter en tant qu'administrateur

Write-Host "🛡️ CONFIGURATION FIREWALL WINDOWS" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier les privilèges administrateur
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Ce script doit être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "   Clic droit sur PowerShell > Exécuter en tant qu'administrateur" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}

Write-Host "✅ Privilèges administrateur détectés" -ForegroundColor Green

# Fonction pour ajouter une règle firewall
function Add-FirewallRule {
    param(
        [string]$RuleName,
        [string]$Port,
        [string]$Protocol = "TCP",
        [string]$Direction = "Inbound"
    )
    
    try {
        # Supprimer la règle existante si elle existe
        Remove-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue
        
        # Ajouter la nouvelle règle
        New-NetFirewallRule -DisplayName $RuleName -Direction $Direction -Protocol $Protocol -LocalPort $Port -Action Allow -Profile Any
        Write-Host "✅ Règle ajoutée: $RuleName (Port $Port)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de l'ajout de la règle: $RuleName" -ForegroundColor Red
        Write-Host "   Détails: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "🔧 Configuration des règles firewall..." -ForegroundColor Yellow

# Règles pour le backend NestJS
Add-FirewallRule -RuleName "Backend Admin - Port 3000" -Port "3000"
Add-FirewallRule -RuleName "Backend Admin - Port 3000 (Outbound)" -Port "3000" -Direction "Outbound"

# Règles pour le frontend (si utilisé)
Add-FirewallRule -RuleName "Frontend Admin - Port 3001" -Port "3001"

# Règles pour PostgreSQL (si utilisé)
Add-FirewallRule -RuleName "PostgreSQL - Port 5432" -Port "5432"

# Règles pour Expo/Metro (développement mobile)
Add-FirewallRule -RuleName "Expo Metro - Port 8081" -Port "8081"
Add-FirewallRule -RuleName "Expo Metro - Port 19000" -Port "19000"
Add-FirewallRule -RuleName "Expo Metro - Port 19001" -Port "19001"
Add-FirewallRule -RuleName "Expo Metro - Port 19002" -Port "19002"

Write-Host ""
Write-Host "🔍 Vérification des règles créées..." -ForegroundColor Yellow

# Vérifier les règles créées
$rules = Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*Admin*" -or $_.DisplayName -like "*Expo*" }
foreach ($rule in $rules) {
    $port = (Get-NetFirewallPortFilter -AssociatedNetFirewallRule $rule).LocalPort
    Write-Host "📋 $($rule.DisplayName) - Port $port - $($rule.Direction) - $($rule.Action)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🧪 Test de connectivité..." -ForegroundColor Yellow

# Tester la connectivité locale
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend accessible en local (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible en local" -ForegroundColor Red
    Write-Host "   Assurez-vous que le backend est démarré avec: npm run start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 Instructions pour l'application mobile:" -ForegroundColor Cyan
Write-Host "1. Connectez votre appareil mobile au même WiFi que ce PC" -ForegroundColor White
Write-Host "2. Utilisez l'IP de ce PC dans l'application mobile:" -ForegroundColor White

# Afficher l'IP du PC
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' } | Select-Object -First 1).IPAddress
if ($ipAddress) {
    Write-Host "   IP du PC: $ipAddress" -ForegroundColor Green
    Write-Host "   URL backend: http://$ipAddress:3000" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Impossible de détecter l'IP du PC" -ForegroundColor Yellow
    Write-Host "   Utilisez: ipconfig | findstr 'IPv4'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 CONFIGURATION FIREWALL TERMINÉE !" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Redémarrez le backend: cd backend && npm run start" -ForegroundColor White
Write-Host "2. Testez depuis le mobile avec l'IP: $ipAddress:3000" -ForegroundColor White
Write-Host "3. Si problème persiste, désactivez temporairement le firewall" -ForegroundColor White

Read-Host "Appuyez sur Entrée pour fermer"
