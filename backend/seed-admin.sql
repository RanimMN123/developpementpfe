-- Seed pour créer l'admin
-- Email: admin@example.com
-- Password: admin123 (hashé avec bcrypt)

-- Supprimer l'admin existant s'il existe (optionnel)
DELETE FROM "Admin" WHERE email = 'admin@example.com';

-- Créer l'admin
INSERT INTO "Admin" (email, password, "createdAt") VALUES (
  'admin@example.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  datetime('now')
);

-- Vérifier que l'admin a été créé
SELECT
  id,
  email,
  "createdAt",
  'admin123' as password_original
FROM "Admin"
WHERE email = 'admin@example.com';
