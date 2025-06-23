@echo off
title Configuration IP Fixe pour Backend Localhost
color 0A

echo.
echo ========================================================
echo 🔧 CONFIGURATION IP FIXE POUR BACKEND LOCALHOST
echo ========================================================
echo.
echo Ce script vous aide à configurer une IP fixe pour votre PC
echo afin que votre mobile puisse toujours se connecter au backend
echo même quand vous changez de réseau WiFi.
echo.

echo 📋 ÉTAPES DE CONFIGURATION:
echo.
echo 1️⃣  Configurer une IP fixe sur votre PC
echo 2️⃣  Backend reste sur localhost (127.0.0.1)
echo 3️⃣  Mobile se connecte à l'IP fixe de votre PC
echo.

echo 🔍 Détection de votre configuration réseau actuelle...
echo.

:: Obtenir l'IP actuelle
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set current_ip=%%a
    goto :found_ip
)

:found_ip
set current_ip=%current_ip: =%
echo 📡 Votre IP actuelle: %current_ip%

:: Déterminer le type de réseau
if "%current_ip:~0,10%"=="192.168.1." (
    set suggested_ip=192.168.1.100
    set gateway=192.168.1.1
    set network_type=Réseau domestique standard
) else if "%current_ip:~0,10%"=="192.168.0." (
    set suggested_ip=192.168.0.100
    set gateway=192.168.0.1
    set network_type=Réseau domestique alternatif
) else if "%current_ip:~0,3%"=="10." (
    set suggested_ip=10.0.0.100
    set gateway=10.0.0.1
    set network_type=Réseau d'entreprise
) else (
    set suggested_ip=192.168.1.100
    set gateway=192.168.1.1
    set network_type=Réseau par défaut
)

echo 🏠 Type de réseau: %network_type%
echo 💡 IP fixe suggérée: %suggested_ip%
echo 🚪 Passerelle suggérée: %gateway%
echo.

echo ⚠️  IMPORTANT: Cette configuration nécessite les droits administrateur
echo.

echo Voulez-vous continuer avec la configuration automatique? (O/N)
set /p choice=

if /i "%choice%"=="O" (
    goto :auto_config
) else if /i "%choice%"=="N" (
    goto :manual_instructions
) else (
    echo Choix invalide. Configuration manuelle affichée.
    goto :manual_instructions
)

:auto_config
echo.
echo 🔧 Configuration automatique en cours...
echo.

:: Vérifier les droits administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Erreur: Droits administrateur requis
    echo 💡 Relancez ce script en tant qu'administrateur
    echo    (Clic droit → "Exécuter en tant qu'administrateur")
    goto :manual_instructions
)

:: Configuration via netsh
echo 📡 Configuration de l'interface réseau...
netsh interface ip set address "Wi-Fi" static %suggested_ip% 255.255.255.0 %gateway%
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

if %errorLevel% equ 0 (
    echo ✅ Configuration automatique réussie!
    echo 📱 IP fixe configurée: %suggested_ip%
    goto :success
) else (
    echo ❌ Erreur lors de la configuration automatique
    echo 💡 Procédure manuelle recommandée
    goto :manual_instructions
)

:manual_instructions
echo.
echo 📋 INSTRUCTIONS DE CONFIGURATION MANUELLE:
echo ========================================================
echo.
echo 1. Ouvrir les Paramètres Windows (Windows + I)
echo 2. Aller dans "Réseau et Internet"
echo 3. Cliquer sur "WiFi"
echo 4. Cliquer sur "Propriétés" de votre réseau actuel
echo 5. Sous "Paramètres IP", cliquer sur "Modifier"
echo 6. Changer de "Automatique (DHCP)" vers "Manuel"
echo 7. Activer "IPv4"
echo 8. Configurer les paramètres suivants:
echo.
echo    📍 Adresse IP: %suggested_ip%
echo    📍 Masque de sous-réseau: 255.255.255.0
echo    📍 Passerelle: %gateway%
echo    📍 DNS préféré: 8.8.8.8
echo    📍 DNS auxiliaire: 8.8.4.4
echo.
echo 9. Cliquer sur "Enregistrer"
echo.

:success
echo 🎯 CONFIGURATION POUR VOTRE MOBILE:
echo ========================================================
echo.
echo Dans votre application mobile, utilisez:
echo.
echo 📱 IP du PC: %suggested_ip%
echo 🖥️  Backend URL: http://%suggested_ip%:3000
echo 🌐 Frontend URL: http://%suggested_ip%:3001
echo.

echo 📝 FICHIER DE CONFIGURATION MOBILE:
echo ========================================================
echo.
echo Modifiez le fichier: mobile/config/fixed-ip-config.js
echo Changez la ligne:
echo   const PC_FIXED_IP = "192.168.1.100";
echo Par:
echo   const PC_FIXED_IP = "%suggested_ip%";
echo.

echo 🧪 TESTS DE VÉRIFICATION:
echo ========================================================
echo.
echo 1. Vérifier l'IP: ipconfig
echo 2. Tester la connectivité: ping %gateway%
echo 3. Tester le backend: curl http://%suggested_ip%:3000/health
echo 4. Depuis le mobile: Ouvrir http://%suggested_ip%:3000/health
echo.

echo 🔄 POUR REVENIR EN DHCP AUTOMATIQUE:
echo ========================================================
echo.
echo Si vous voulez revenir à la configuration automatique:
echo 1. Paramètres → Réseau → WiFi → Propriétés
echo 2. Paramètres IP → Modifier → Automatique (DHCP)
echo.
echo Ou via commande:
echo netsh interface ip set address "Wi-Fi" dhcp
echo netsh interface ip set dns "Wi-Fi" dhcp
echo.

echo 💡 CONSEILS:
echo ========================================================
echo.
echo • Cette IP fixe fonctionne sur TOUS les réseaux WiFi
echo • Votre backend reste sur localhost (stable)
echo • Votre mobile se connecte toujours à la même IP
echo • Pas besoin de reconfigurer à chaque changement de WiFi
echo.

echo ✅ Configuration terminée!
echo.
pause
