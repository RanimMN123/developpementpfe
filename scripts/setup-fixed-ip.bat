@echo off
echo 🔧 Configuration d'une adresse IP fixe pour le développement
echo ============================================================

echo.
echo 📋 Instructions pour configurer une IP fixe:
echo.
echo 1. Ouvrir les Paramètres Windows (Windows + I)
echo 2. Aller dans "Réseau et Internet"
echo 3. Cliquer sur "WiFi" puis "Propriétés" de votre réseau
echo 4. Sous "Paramètres IP", cliquer sur "Modifier"
echo 5. Changer de "Automatique (DHCP)" vers "Manuel"
echo 6. Activer "IPv4" et configurer:
echo.
echo    📍 Adresse IP: 192.168.1.100 (ou 192.168.0.100)
echo    📍 Masque de sous-réseau: 255.255.255.0
echo    📍 Passerelle: 192.168.1.1 (adresse de votre routeur)
echo    📍 DNS préféré: 8.8.8.8
echo    📍 DNS auxiliaire: 8.8.4.4
echo.
echo 7. Cliquer sur "Enregistrer"
echo.

echo 🚀 Voulez-vous exécuter le script PowerShell automatique? (O/N)
set /p choice=

if /i "%choice%"=="O" (
    echo 🔧 Lancement du script PowerShell...
    powershell -ExecutionPolicy Bypass -File "%~dp0configure-static-ip.ps1"
) else (
    echo ℹ️  Configuration manuelle recommandée
)

echo.
echo 📱 Une fois l'IP fixe configurée, votre mobile pourra se connecter à:
echo    Backend: http://[VOTRE_IP_FIXE]:3000
echo    Frontend: http://[VOTRE_IP_FIXE]:3001
echo.
echo 💡 Pour vérifier votre IP actuelle: ipconfig
echo.

pause
