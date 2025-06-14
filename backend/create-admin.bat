@echo off
echo 🔄 Création de l'admin dans la base de données...
echo.
echo Email: admin@example.com
echo Password: admin123
echo.
echo 📝 Exécution de la requête SQL...

sqlite3 prisma/dev.db "INSERT INTO Admin (email, password, createdAt) VALUES ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2025-05-31T01:30:00.000Z');"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Admin créé avec succès !
    echo.
    echo 🔐 Identifiants de connexion :
    echo Email: admin@example.com
    echo Mot de passe: admin123
    echo.
    echo 🌐 Connectez-vous sur : http://localhost:3001/login
) else (
    echo ❌ Erreur lors de la création de l'admin
    echo.
    echo 📝 Requête SQL à exécuter manuellement :
    echo INSERT INTO Admin (email, password, createdAt) VALUES (
    echo   'admin@example.com',
    echo   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    echo   '2025-05-31T01:30:00.000Z'
    echo );
)

pause
