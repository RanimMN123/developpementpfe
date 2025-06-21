# Script PowerShell pour configurer une IP statique
# Exécuter en tant qu'administrateur

Write-Host "🔧 Configuration d'une adresse IP statique pour le développement" -ForegroundColor Green
Write-Host "=" * 60

# Obtenir l'interface réseau active
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.PhysicalMediaType -eq "802.11"}

if (-not $adapter) {
    $adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
}

if (-not $adapter) {
    Write-Host "❌ Aucune interface réseau active trouvée" -ForegroundColor Red
    exit 1
}

Write-Host "📡 Interface réseau détectée: $($adapter.Name)" -ForegroundColor Yellow

# Obtenir la configuration réseau actuelle
$currentConfig = Get-NetIPConfiguration -InterfaceAlias $adapter.Name

Write-Host "🔍 Configuration actuelle:" -ForegroundColor Cyan
Write-Host "   IP actuelle: $($currentConfig.IPv4Address.IPAddress)"
Write-Host "   Passerelle: $($currentConfig.IPv4DefaultGateway.NextHop)"

# Déterminer le réseau (192.168.1.x ou 192.168.0.x)
$gateway = $currentConfig.IPv4DefaultGateway.NextHop
$networkBase = ""

if ($gateway -like "192.168.1.*") {
    $networkBase = "192.168.1"
    $staticIP = "192.168.1.100"
} elseif ($gateway -like "192.168.0.*") {
    $networkBase = "192.168.0"
    $staticIP = "192.168.0.100"
} elseif ($gateway -like "10.0.0.*") {
    $networkBase = "10.0.0"
    $staticIP = "10.0.0.100"
} else {
    Write-Host "⚠️  Réseau non standard détecté: $gateway" -ForegroundColor Yellow
    $networkBase = $gateway.Substring(0, $gateway.LastIndexOf('.'))
    $staticIP = "$networkBase.100"
}

Write-Host "🎯 IP statique proposée: $staticIP" -ForegroundColor Green

# Demander confirmation
$confirm = Read-Host "Voulez-vous configurer cette IP statique ? (O/N)"

if ($confirm -eq "O" -or $confirm -eq "o" -or $confirm -eq "Y" -or $confirm -eq "y") {
    try {
        Write-Host "🔧 Configuration de l'IP statique..." -ForegroundColor Yellow
        
        # Supprimer l'ancienne configuration IP
        Remove-NetIPAddress -InterfaceAlias $adapter.Name -Confirm:$false -ErrorAction SilentlyContinue
        Remove-NetRoute -InterfaceAlias $adapter.Name -Confirm:$false -ErrorAction SilentlyContinue
        
        # Configurer la nouvelle IP statique
        New-NetIPAddress -InterfaceAlias $adapter.Name -IPAddress $staticIP -PrefixLength 24 -DefaultGateway $gateway
        
        # Configurer les serveurs DNS
        Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses "8.8.8.8", "8.8.4.4"
        
        Write-Host "✅ Configuration terminée avec succès !" -ForegroundColor Green
        Write-Host "📱 Adresse IP fixe pour votre mobile: $staticIP" -ForegroundColor Cyan
        Write-Host "🖥️  Backend accessible sur: http://$staticIP:3000" -ForegroundColor Cyan
        
        # Tester la connectivité
        Write-Host "🧪 Test de connectivité..." -ForegroundColor Yellow
        $ping = Test-NetConnection -ComputerName $gateway -Port 80 -InformationLevel Quiet
        
        if ($ping) {
            Write-Host "✅ Connectivité réseau OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Problème de connectivité détecté" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Erreur lors de la configuration: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Assurez-vous d'exécuter ce script en tant qu'administrateur" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Configuration annulée" -ForegroundColor Red
}

Write-Host "`n📋 Résumé pour votre mobile:" -ForegroundColor Cyan
Write-Host "   IP du PC: $staticIP" -ForegroundColor White
Write-Host "   URL Backend: http://$staticIP:3000" -ForegroundColor White
Write-Host "   URL Frontend: http://$staticIP:3001" -ForegroundColor White

Write-Host "`n💡 Pour revenir en DHCP automatique:" -ForegroundColor Yellow
Write-Host "   Set-NetIPInterface -InterfaceAlias '$($adapter.Name)' -Dhcp Enabled" -ForegroundColor Gray

Read-Host "`nAppuyez sur Entrée pour fermer"
