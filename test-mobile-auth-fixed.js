// Test des corrections d'authentification mobile
// Simule les requêtes mobiles avec User-Agent okhttp

const http = require('http');

const BACKEND_IP = '192.168.100.44';
const BACKEND_PORT = '3000';
const BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

// Fonction pour faire une requête HTTP avec User-Agent mobile
function makeMobileRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'okhttp/4.9.2', // User-Agent mobile typique
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test des corrections d'authentification mobile
async function testMobileAuthFixes() {
  console.log('🔧 TEST DES CORRECTIONS D\'AUTHENTIFICATION MOBILE');
  console.log('=' .repeat(60));
  console.log(`Backend: ${BASE_URL}`);
  console.log('User-Agent: okhttp/4.9.2 (simulation mobile)');
  console.log('');

  let testResults = [];

  // 1. Test d'inscription mobile (sans CSRF)
  console.log('📝 1. TEST D\'INSCRIPTION MOBILE (SANS CSRF)');
  try {
    const signupData = {
      name: 'Test Mobile User',
      email: 'testmobile@example.com',
      password: 'testpassword123'
    };
    
    const response = await makeMobileRequest(`${BASE_URL}/users/signup`, 'POST', signupData);
    
    if (response.status === 201 || response.status === 409) { // 201 = créé, 409 = existe déjà
      console.log(`   ✅ SUCCÈS: Inscription mobile (${response.status})`);
      console.log(`   📊 Réponse: ${JSON.stringify(response.data).substring(0, 100)}...`);
      testResults.push({ test: 'Mobile Signup', status: 'PASS' });
    } else if (response.status === 403) {
      console.log(`   ❌ ÉCHEC: CSRF encore actif (${response.status})`);
      testResults.push({ test: 'Mobile Signup', status: 'FAIL' });
    } else {
      console.log(`   ⚠️  AUTRE: Status ${response.status}`);
      console.log(`   📄 Réponse: ${JSON.stringify(response.data).substring(0, 100)}...`);
      testResults.push({ test: 'Mobile Signup', status: 'PARTIAL' });
    }
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`);
    testResults.push({ test: 'Mobile Signup', status: 'ERROR' });
  }

  // 2. Test de connexion mobile (sans CSRF)
  console.log('\n🔐 2. TEST DE CONNEXION MOBILE (SANS CSRF)');
  try {
    const loginData = {
      email: 'testmobile@example.com',
      password: 'testpassword123'
    };
    
    const response = await makeMobileRequest(`${BASE_URL}/users/login`, 'POST', loginData);
    
    if (response.status === 200 || response.status === 401) { // 200 = OK, 401 = mauvais identifiants
      console.log(`   ✅ SUCCÈS: Connexion mobile accessible (${response.status})`);
      console.log(`   📊 Réponse: ${JSON.stringify(response.data).substring(0, 100)}...`);
      testResults.push({ test: 'Mobile Login', status: 'PASS' });
    } else if (response.status === 403) {
      console.log(`   ❌ ÉCHEC: CSRF encore actif (${response.status})`);
      testResults.push({ test: 'Mobile Login', status: 'FAIL' });
    } else if (response.status === 429) {
      console.log(`   ⚠️  RATE LIMIT: Trop de tentatives (${response.status})`);
      testResults.push({ test: 'Mobile Login', status: 'RATE_LIMITED' });
    } else {
      console.log(`   ⚠️  AUTRE: Status ${response.status}`);
      testResults.push({ test: 'Mobile Login', status: 'PARTIAL' });
    }
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`);
    testResults.push({ test: 'Mobile Login', status: 'ERROR' });
  }

  // 3. Test de rate limiting amélioré
  console.log('\n⏱️  3. TEST DE RATE LIMITING AMÉLIORÉ');
  try {
    console.log('   Envoi de 3 requêtes rapides...');
    
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(makeMobileRequest(`${BASE_URL}/users/login`, 'POST', {
        email: 'test@test.com',
        password: 'wrongpassword'
      }));
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status !== 429).length;
    
    if (successCount >= 2) {
      console.log(`   ✅ SUCCÈS: Rate limiting amélioré (${successCount}/3 requêtes passées)`);
      testResults.push({ test: 'Improved Rate Limiting', status: 'PASS' });
    } else {
      console.log(`   ❌ ÉCHEC: Rate limiting trop strict (${successCount}/3 requêtes passées)`);
      testResults.push({ test: 'Improved Rate Limiting', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`);
    testResults.push({ test: 'Improved Rate Limiting', status: 'ERROR' });
  }

  // 4. Test des APIs mobiles standard
  console.log('\n📱 4. TEST DES APIs MOBILES STANDARD');
  try {
    const response = await makeMobileRequest(`${BASE_URL}/articles/categories-with-products`);
    
    if (response.status === 200) {
      console.log(`   ✅ SUCCÈS: APIs mobiles accessibles`);
      testResults.push({ test: 'Mobile APIs', status: 'PASS' });
    } else {
      console.log(`   ❌ ÉCHEC: APIs mobiles inaccessibles (${response.status})`);
      testResults.push({ test: 'Mobile APIs', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`);
    testResults.push({ test: 'Mobile APIs', status: 'ERROR' });
  }

  // Résumé des tests
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DES CORRECTIONS');
  console.log('=' .repeat(60));
  
  const passedTests = testResults.filter(t => t.status === 'PASS').length;
  const totalTests = testResults.length;
  
  testResults.forEach(result => {
    let icon = '❌';
    if (result.status === 'PASS') icon = '✅';
    else if (result.status === 'PARTIAL') icon = '⚠️';
    else if (result.status === 'RATE_LIMITED') icon = '⏱️';
    else if (result.status === 'ERROR') icon = '💥';
    
    console.log(`${icon} ${result.test}: ${result.status}`);
  });
  
  console.log(`\n📈 Score: ${passedTests}/${totalTests} (${Math.round((passedTests/totalTests) * 100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TOUTES LES CORRECTIONS FONCTIONNENT !');
    console.log('📱 L\'application mobile peut maintenant s\'authentifier sans problème');
  } else if (passedTests >= totalTests * 0.75) {
    console.log('\n✅ LA PLUPART DES CORRECTIONS FONCTIONNENT');
    console.log('📱 L\'application mobile devrait être largement utilisable');
  } else {
    console.log('\n⚠️  CERTAINES CORRECTIONS NÉCESSITENT ENCORE ATTENTION');
    console.log('📱 Vérifiez les logs du backend pour plus de détails');
  }
}

// Exécuter les tests
testMobileAuthFixes().catch(console.error);
