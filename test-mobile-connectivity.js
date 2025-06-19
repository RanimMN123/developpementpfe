// Test de connectivité mobile avec le backend dockerisé
// Simule les requêtes que l'application mobile ferait

const https = require('https');
const http = require('http');

// Configuration
const BACKEND_IP = '192.168.100.44';
const BACKEND_PORT = '3000';
const BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

// Fonction pour faire une requête HTTP
function makeRequest(url, method = 'GET', data = null) {
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
        'User-Agent': 'Mobile-App-Test/1.0'
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

// Tests de connectivité mobile
async function testMobileConnectivity() {
  console.log('🧪 TEST DE CONNECTIVITÉ MOBILE AVEC BACKEND DOCKERISÉ');
  console.log('=' .repeat(60));
  console.log(`Backend URL: ${BASE_URL}`);
  console.log('');

  const tests = [
    {
      name: '1. Health Check',
      url: `${BASE_URL}/health`,
      description: 'Vérification de l\'état du backend'
    },
    {
      name: '2. Categories avec Produits (API Mobile)',
      url: `${BASE_URL}/articles/categories-with-products`,
      description: 'API principale utilisée par l\'app mobile'
    },
    {
      name: '3. Test Ping',
      url: `${BASE_URL}/test/ping`,
      description: 'Endpoint de test simple'
    },
    {
      name: '4. Categories',
      url: `${BASE_URL}/categories`,
      description: 'Liste des catégories'
    },
    {
      name: '5. Produits',
      url: `${BASE_URL}/products/products`,
      description: 'Liste des produits'
    },
    {
      name: '6. Users',
      url: `${BASE_URL}/users`,
      description: 'Liste des utilisateurs'
    }
  ];

  let successCount = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n🔍 ${test.name}`);
      console.log(`   ${test.description}`);
      console.log(`   URL: ${test.url}`);
      
      const startTime = Date.now();
      const response = await makeRequest(test.url);
      const duration = Date.now() - startTime;
      
      if (response.status >= 200 && response.status < 400) {
        console.log(`   ✅ SUCCÈS (${response.status}) - ${duration}ms`);
        if (response.data && typeof response.data === 'object') {
          console.log(`   📊 Données: ${JSON.stringify(response.data).substring(0, 100)}...`);
        }
        successCount++;
      } else {
        console.log(`   ⚠️  RÉPONSE (${response.status}) - ${duration}ms`);
        console.log(`   📄 Contenu: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERREUR: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(60));
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);
  console.log(`📈 Taux de réussite: ${Math.round((successCount/totalTests) * 100)}%`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('📱 L\'application mobile peut se connecter au backend dockerisé');
  } else if (successCount > 0) {
    console.log('\n⚠️  CONNECTIVITÉ PARTIELLE');
    console.log('📱 Certaines fonctionnalités mobiles fonctionnent');
  } else {
    console.log('\n❌ AUCUNE CONNECTIVITÉ');
    console.log('📱 L\'application mobile ne peut pas se connecter');
  }

  console.log('\n🔧 INFORMATIONS DE DÉBOGAGE:');
  console.log(`   - IP Backend: ${BACKEND_IP}`);
  console.log(`   - Port Backend: ${BACKEND_PORT}`);
  console.log(`   - URL complète: ${BASE_URL}`);
  console.log('   - Assurez-vous que Docker est en cours d\'exécution');
  console.log('   - Vérifiez que les conteneurs sont actifs: docker ps');
}

// Exécuter les tests
testMobileConnectivity().catch(console.error);
