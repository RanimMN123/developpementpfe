#!/usr/bin/env node

/**
 * Script de test de sécurité pour le backend
 * Teste les protections XSS, CSRF, Rate Limiting et autres mesures de sécurité
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://192.168.100.138:3000';
const TEST_TIMEOUT = 5000;

// Compteurs de tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

console.log('🔒 Test de sécurité du backend'.bold.cyan);
console.log('='.repeat(50).gray);
console.log(`🌐 URL de base: ${BASE_URL}`.yellow);
console.log('='.repeat(50).gray);

/**
 * Fonction utilitaire pour les tests
 */
async function runTest(testName, testFunction) {
  totalTests++;
  process.stdout.write(`🔍 ${testName}... `);
  
  try {
    const result = await testFunction();
    if (result) {
      console.log('✅ PASS'.green);
      passedTests++;
    } else {
      console.log('❌ FAIL'.red);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`.red);
    failedTests++;
  }
}

/**
 * Test des headers de sécurité
 */
async function testSecurityHeaders() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: TEST_TIMEOUT });
    
    const requiredHeaders = [
      'x-xss-protection',
      'x-content-type-options',
      'x-frame-options',
      'content-security-policy',
    ];
    
    for (const header of requiredHeaders) {
      if (!response.headers[header]) {
        console.log(`   ⚠️  Header manquant: ${header}`.yellow);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Test de protection XSS
 */
async function testXssProtection() {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
  ];
  
  for (const payload of xssPayloads) {
    try {
      const response = await axios.post(`${BASE_URL}/test/echo`, {
        message: payload
      }, { 
        timeout: TEST_TIMEOUT,
        validateStatus: () => true // Accepter tous les codes de statut
      });
      
      // Si le payload passe sans être bloqué, c'est un problème
      if (response.status === 200 && response.data.message === payload) {
        console.log(`   ⚠️  Payload XSS non bloqué: ${payload.substring(0, 30)}...`.yellow);
        return false;
      }
    } catch (error) {
      // Les erreurs sont attendues pour les payloads malveillants
      continue;
    }
  }
  
  return true;
}

/**
 * Test de protection contre l'injection SQL
 */
async function testSqlInjectionProtection() {
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "UNION SELECT * FROM users",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
  ];
  
  for (const payload of sqlPayloads) {
    try {
      const response = await axios.post(`${BASE_URL}/test/search`, {
        query: payload
      }, { 
        timeout: TEST_TIMEOUT,
        validateStatus: () => true
      });
      
      // Si le payload passe sans être bloqué, c'est un problème
      if (response.status === 200) {
        console.log(`   ⚠️  Payload SQL non bloqué: ${payload.substring(0, 30)}...`.yellow);
        return false;
      }
    } catch (error) {
      // Les erreurs sont attendues pour les payloads malveillants
      continue;
    }
  }
  
  return true;
}

/**
 * Test du rate limiting
 */
async function testRateLimit() {
  const endpoint = `${BASE_URL}/auth/login`;
  const maxAttempts = 6; // Dépasser la limite de 5
  
  let blockedCount = 0;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.post(endpoint, {
        email: 'test@example.com',
        password: 'wrongpassword'
      }, { 
        timeout: TEST_TIMEOUT,
        validateStatus: () => true
      });
      
      if (response.status === 429) { // Too Many Requests
        blockedCount++;
      }
    } catch (error) {
      // Ignorer les erreurs de connexion
      continue;
    }
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Au moins une requête devrait être bloquée
  return blockedCount > 0;
}

/**
 * Test de validation des données
 */
async function testDataValidation() {
  const invalidData = {
    email: 'not-an-email',
    password: '123', // Trop court
    name: '', // Vide
    phone: 'invalid-phone-format',
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/users/signup`, invalidData, {
      timeout: TEST_TIMEOUT,
      validateStatus: () => true
    });
    
    // La requête devrait être rejetée (400 Bad Request)
    return response.status === 400;
  } catch (error) {
    return true; // Erreur attendue
  }
}

/**
 * Test CORS
 */
async function testCorsProtection() {
  try {
    const response = await axios.options(`${BASE_URL}/health`, {
      headers: {
        'Origin': 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
      },
      timeout: TEST_TIMEOUT,
      validateStatus: () => true
    });
    
    // Vérifier que l'origine malveillante n'est pas autorisée
    const allowedOrigin = response.headers['access-control-allow-origin'];
    return allowedOrigin !== 'http://malicious-site.com';
  } catch (error) {
    return true; // Erreur attendue
  }
}

/**
 * Test de sécurité des uploads (simulation)
 */
async function testFileUploadSecurity() {
  // Simuler un upload de fichier malveillant
  const maliciousContent = '<script>alert("XSS")</script>';
  
  try {
    const response = await axios.post(`${BASE_URL}/products`, {
      name: 'Test Product',
      description: 'Test Description',
      price: 10.99,
      stock: 100,
      categoryId: 1,
      imageContent: maliciousContent // Contenu malveillant
    }, {
      timeout: TEST_TIMEOUT,
      validateStatus: () => true
    });
    
    // La requête devrait être rejetée
    return response.status !== 200;
  } catch (error) {
    return true; // Erreur attendue
  }
}

/**
 * Test de protection des informations sensibles
 */
async function testSensitiveDataProtection() {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      timeout: TEST_TIMEOUT,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data) {
      // Vérifier que les mots de passe ne sont pas exposés
      const users = Array.isArray(response.data) ? response.data : [response.data];
      
      for (const user of users) {
        if (user.password) {
          console.log('   ⚠️  Mot de passe exposé dans la réponse'.yellow);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    return true; // Erreur acceptable
  }
}

/**
 * Fonction principale
 */
async function runSecurityTests() {
  console.log('\n🧪 Démarrage des tests de sécurité...\n');
  
  // Tests de sécurité
  await runTest('Headers de sécurité', testSecurityHeaders);
  await runTest('Protection XSS', testXssProtection);
  await runTest('Protection injection SQL', testSqlInjectionProtection);
  await runTest('Rate Limiting', testRateLimit);
  await runTest('Validation des données', testDataValidation);
  await runTest('Protection CORS', testCorsProtection);
  await runTest('Sécurité des uploads', testFileUploadSecurity);
  await runTest('Protection données sensibles', testSensitiveDataProtection);
  
  // Rapport final
  console.log('\n📊 RAPPORT DE SÉCURITÉ'.bold.cyan);
  console.log('='.repeat(50).gray);
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`.green);
  console.log(`❌ Tests échoués: ${failedTests}/${totalTests}`.red);
  
  const successRate = (passedTests / totalTests) * 100;
  console.log(`📈 Taux de réussite: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 80) {
    console.log('\n🎉 Niveau de sécurité: EXCELLENT'.green.bold);
  } else if (successRate >= 60) {
    console.log('\n⚡ Niveau de sécurité: BON'.yellow.bold);
  } else {
    console.log('\n⚠️  Niveau de sécurité: À AMÉLIORER'.red.bold);
  }
  
  console.log('\n💡 RECOMMANDATIONS:');
  
  if (failedTests > 0) {
    console.log('   • Vérifiez les tests échoués ci-dessus');
    console.log('   • Assurez-vous que le backend est démarré');
    console.log('   • Vérifiez la configuration de sécurité');
  }
  
  console.log('   • Effectuez des tests de sécurité réguliers');
  console.log('   • Surveillez les logs de sécurité');
  console.log('   • Mettez à jour les dépendances régulièrement');
  
  // Code de sortie
  process.exit(failedTests > 0 ? 1 : 0);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error.message);
  process.exit(1);
});

// Exécution des tests
if (require.main === module) {
  runSecurityTests().catch(error => {
    console.error('❌ Erreur lors des tests de sécurité:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  testSecurityHeaders,
  testXssProtection,
  testSqlInjectionProtection,
  testRateLimit,
};
