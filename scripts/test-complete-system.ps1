# Script de test automatisé complet
# Usage: .\scripts\test-complete-system.ps1

param(
    [switch]$Verbose = $false,
    [switch]$FixIssues = $false
)

Write-Host "🧪 TEST AUTOMATISÉ COMPLET - SYSTÈME FINAL" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host "Date: $(Get-Date)" -ForegroundColor Yellow
Write-Host "Mode Verbose: $Verbose" -ForegroundColor Yellow
Write-Host "Auto-Fix: $FixIssues" -ForegroundColor Yellow
Write-Host ""

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Green
}

# Fonction pour les tests
function Test-Endpoint {
    param([string]$Url, [string]$Description)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
        Write-Host "✅ $Description : OK" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        return $true
    } catch {
        Write-Host "❌ $Description : ÉCHEC" -ForegroundColor Red
        if ($Verbose) {
            Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
        }
        return $false
    }
}

# Variables de test
$backendLocalhost = "http://localhost:3000"
$backendIP = "http://192.168.100.187:3000"
$testResults = @{}

# 1. TESTS BACKEND DOCKER
Write-Step "Tests Backend Docker..."

Write-Host "🔍 Test 1: Ping localhost..." -ForegroundColor Yellow
$testResults["backend_localhost_ping"] = Test-Endpoint "$backendLocalhost/test/ping" "Backend localhost ping"

Write-Host "🔍 Test 2: Ping IP PC..." -ForegroundColor Yellow
$testResults["backend_ip_ping"] = Test-Endpoint "$backendIP/test/ping" "Backend IP PC ping"

Write-Host "🔍 Test 3: API Catégories localhost..." -ForegroundColor Yellow
$testResults["backend_localhost_categories"] = Test-Endpoint "$backendLocalhost/categories" "API Catégories localhost"

Write-Host "🔍 Test 4: API Catégories IP PC..." -ForegroundColor Yellow
$testResults["backend_ip_categories"] = Test-Endpoint "$backendIP/categories" "API Catégories IP PC"

Write-Host "🔍 Test 5: Image statique..." -ForegroundColor Yellow
try {
    $imageResponse = Invoke-WebRequest -Uri "$backendLocalhost/public/images/image-1748895816150-207160491.png" -Method Head -TimeoutSec 5
    if ($imageResponse.StatusCode -eq 200) {
        Write-Host "✅ Image statique : OK (Taille: $($imageResponse.Headers.'Content-Length') bytes)" -ForegroundColor Green
        $testResults["backend_static_image"] = $true
    } else {
        Write-Host "❌ Image statique : Code $($imageResponse.StatusCode)" -ForegroundColor Red
        $testResults["backend_static_image"] = $false
    }
} catch {
    Write-Host "❌ Image statique : ÉCHEC" -ForegroundColor Red
    $testResults["backend_static_image"] = $false
}

# 2. TESTS DOCKER
Write-Step "Tests Infrastructure Docker..."

Write-Host "🔍 Test 6: Statut conteneur..." -ForegroundColor Yellow
try {
    $containers = docker ps --filter "name=admin_backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers -match "admin_backend") {
        Write-Host "✅ Conteneur backend : ACTIF" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "   $containers" -ForegroundColor Gray
        }
        $testResults["docker_container_status"] = $true
    } else {
        Write-Host "❌ Conteneur backend : INACTIF" -ForegroundColor Red
        $testResults["docker_container_status"] = $false
    }
} catch {
    Write-Host "❌ Conteneur backend : ERREUR" -ForegroundColor Red
    $testResults["docker_container_status"] = $false
}

Write-Host "🔍 Test 7: Logs Docker..." -ForegroundColor Yellow
try {
    $logs = docker logs admin_backend_final --tail 10 2>&1
    if ($logs -match "Nest application successfully started" -or $logs -match "Backend fonctionne") {
        Write-Host "✅ Logs Docker : Backend démarré correctement" -ForegroundColor Green
        $testResults["docker_logs"] = $true
    } else {
        Write-Host "❌ Logs Docker : Backend non démarré" -ForegroundColor Red
        $testResults["docker_logs"] = $false
    }
    
    if ($Verbose) {
        Write-Host "   Derniers logs:" -ForegroundColor Gray
        $logs | Select-Object -Last 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    }
} catch {
    Write-Host "❌ Logs Docker : INACCESSIBLES" -ForegroundColor Red
    $testResults["docker_logs"] = $false
}

# 3. TESTS RÉSEAU
Write-Step "Tests Réseau et Connectivité..."

Write-Host "🔍 Test 8: Port 3000 ouvert..." -ForegroundColor Yellow
try {
    $portTest = Test-NetConnection -ComputerName "localhost" -Port 3000 -WarningAction SilentlyContinue
    if ($portTest.TcpTestSucceeded) {
        Write-Host "✅ Port 3000 : OUVERT" -ForegroundColor Green
        $testResults["network_port_3000"] = $true
    } else {
        Write-Host "❌ Port 3000 : FERMÉ" -ForegroundColor Red
        $testResults["network_port_3000"] = $false
    }
} catch {
    Write-Host "❌ Port 3000 : TEST ÉCHOUÉ" -ForegroundColor Red
    $testResults["network_port_3000"] = $false
}

Write-Host "🔍 Test 9: IP PC accessible..." -ForegroundColor Yellow
try {
    $pingTest = Test-Connection -ComputerName "192.168.100.187" -Count 1 -Quiet
    if ($pingTest) {
        Write-Host "✅ IP PC 192.168.100.187 : ACCESSIBLE" -ForegroundColor Green
        $testResults["network_ip_accessible"] = $true
    } else {
        Write-Host "❌ IP PC 192.168.100.187 : INACCESSIBLE" -ForegroundColor Red
        $testResults["network_ip_accessible"] = $false
    }
} catch {
    Write-Host "❌ IP PC : TEST ÉCHOUÉ" -ForegroundColor Red
    $testResults["network_ip_accessible"] = $false
}

# 4. TESTS BASE DE DONNÉES
Write-Step "Tests Base de Données..."

Write-Host "🔍 Test 10: Connexion Prisma..." -ForegroundColor Yellow
try {
    $dbLogs = docker logs admin_backend_final 2>&1 | Select-String "Prisma connected"
    if ($dbLogs) {
        Write-Host "✅ Base de données : CONNECTÉE" -ForegroundColor Green
        $testResults["database_connection"] = $true
    } else {
        Write-Host "❌ Base de données : NON CONNECTÉE" -ForegroundColor Red
        $testResults["database_connection"] = $false
    }
} catch {
    Write-Host "❌ Base de données : TEST ÉCHOUÉ" -ForegroundColor Red
    $testResults["database_connection"] = $false
}

# 5. TESTS MOBILE (si disponible)
Write-Step "Tests Configuration Mobile..."

Write-Host "🔍 Test 11: Configuration mobile..." -ForegroundColor Yellow
if (Test-Path "mobile/services/GlobalIPManager.js") {
    Write-Host "✅ GlobalIPManager : PRÉSENT" -ForegroundColor Green
    $testResults["mobile_config"] = $true
} else {
    Write-Host "❌ GlobalIPManager : ABSENT" -ForegroundColor Red
    $testResults["mobile_config"] = $false
}

Write-Host "🔍 Test 12: Dépendances mobile..." -ForegroundColor Yellow
if (Test-Path "mobile/node_modules") {
    Write-Host "✅ Dépendances mobile : INSTALLÉES" -ForegroundColor Green
    $testResults["mobile_dependencies"] = $true
} else {
    Write-Host "❌ Dépendances mobile : NON INSTALLÉES" -ForegroundColor Red
    $testResults["mobile_dependencies"] = $false
}

# 6. AUTO-FIX (si activé)
if ($FixIssues) {
    Write-Step "Correction automatique des problèmes..."
    
    if (-not $testResults["docker_container_status"]) {
        Write-Host "🔧 Redémarrage du conteneur backend..." -ForegroundColor Yellow
        docker run -d -p 3000:3000 `
            -e DATABASE_URL="postgresql://postgres:Azerty123*@host.docker.internal:5432/adminapp?schema=public" `
            --name admin_backend_final_fixed `
            ranimmn/ranouma:backend-final-18-06-2025
        Start-Sleep -Seconds 10
    }
    
    if (-not $testResults["mobile_dependencies"]) {
        Write-Host "🔧 Installation des dépendances mobile..." -ForegroundColor Yellow
        Push-Location "mobile"
        npm install
        Pop-Location
    }
}

# 7. RÉSUMÉ DES RÉSULTATS
Write-Host ""
Write-Host "=" * 70
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "=" * 70

$totalTests = $testResults.Count
$passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
$failedTests = $totalTests - $passedTests

Write-Host "📈 Statistiques:" -ForegroundColor Yellow
Write-Host "   • Total des tests: $totalTests" -ForegroundColor White
Write-Host "   • Tests réussis: $passedTests" -ForegroundColor Green
Write-Host "   • Tests échoués: $failedTests" -ForegroundColor Red
Write-Host "   • Taux de réussite: $([math]::Round(($passedTests / $totalTests) * 100, 1))%" -ForegroundColor Yellow

Write-Host ""
Write-Host "📋 Détail des résultats:" -ForegroundColor Yellow
foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "   $($test.Key): $status" -ForegroundColor $color
}

# 8. RECOMMANDATIONS
Write-Host ""
Write-Host "🎯 RECOMMANDATIONS:" -ForegroundColor Cyan

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 PARFAIT ! Tous les tests passent !" -ForegroundColor Green
    Write-Host "   • Votre système est entièrement fonctionnel" -ForegroundColor White
    Write-Host "   • Vous pouvez procéder au build final de l'APK" -ForegroundColor White
    Write-Host "   • Commande: .\scripts\build-final-apk.ps1" -ForegroundColor White
} elseif ($passedTests / $totalTests -gt 0.8) {
    Write-Host "✅ TRÈS BIEN ! La plupart des tests passent" -ForegroundColor Green
    Write-Host "   • Système globalement fonctionnel" -ForegroundColor White
    Write-Host "   • Quelques ajustements mineurs nécessaires" -ForegroundColor White
} elseif ($passedTests / $totalTests -gt 0.5) {
    Write-Host "⚠️ MOYEN. Plusieurs problèmes détectés" -ForegroundColor Yellow
    Write-Host "   • Vérifiez les tests échoués" -ForegroundColor White
    Write-Host "   • Relancez avec --FixIssues pour correction automatique" -ForegroundColor White
} else {
    Write-Host "❌ PROBLÈMES MAJEURS détectés" -ForegroundColor Red
    Write-Host "   • Système non fonctionnel" -ForegroundColor White
    Write-Host "   • Vérifiez la configuration Docker" -ForegroundColor White
    Write-Host "   • Consultez les logs: docker logs admin_backend_final" -ForegroundColor White
}

Write-Host ""
Write-Host "📞 Support:" -ForegroundColor Yellow
Write-Host "   • Logs détaillés: .\scripts\test-complete-system.ps1 -Verbose" -ForegroundColor White
Write-Host "   • Correction auto: .\scripts\test-complete-system.ps1 -FixIssues" -ForegroundColor White
Write-Host "   • Guide complet: TESTING_GUIDE.md" -ForegroundColor White

Write-Host ""
