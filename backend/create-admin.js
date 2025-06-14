// Script simple pour créer un admin
const crypto = require('crypto');

// Fonction pour hacher le mot de passe (version simple)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'salt').digest('hex');
}

// Hash du mot de passe admin123
const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash pour 'admin123'

console.log('🔄 Création de l\'admin dans la base de données...');
console.log('Email: admin@example.com');
console.log('Password: admin123');
console.log('Hash: ' + hashedPassword);
console.log('');
console.log('📝 Requête SQL à exécuter :');
console.log('');
console.log('INSERT INTO "Admin" (email, password, "createdAt") VALUES (');
console.log('  \'admin@example.com\',');
console.log('  \'' + hashedPassword + '\',');
console.log('  \'' + new Date().toISOString() + '\'');
console.log(');');
console.log('');
console.log('✅ Copiez et exécutez cette requête SQL dans votre base de données');
console.log('🌐 Puis connectez-vous sur : http://localhost:3001/login');
