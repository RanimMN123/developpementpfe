// Script de test pour vérifier la route PUT /orders/:id
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testOrderRoute() {
  console.log('🧪 Test de la route PUT /orders/:id');
  
  try {
    // Test 1: Vérifier que le serveur répond
    console.log('\n1. Test de connexion au serveur...');
    const healthCheck = await axios.get(`${BASE_URL}/orders`);
    console.log('✅ Serveur accessible');
    
    // Test 2: Tester la route PUT avec des données de paiement
    console.log('\n2. Test de la route PUT /orders/1...');
    
    const testData = {
      status: 'DELIVERED',
      paymentMethod: 'ESPECE',
      grossAmount: 45.750,
      reduction: 0,
      netAmount: 45.750
    };
    
    try {
      const response = await axios.put(`${BASE_URL}/orders/1`, testData);
      console.log('✅ Route PUT /orders/1 fonctionne');
      console.log('📄 Réponse:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('📡 Statut:', error.response.status);
        console.log('📄 Réponse:', error.response.data);
        
        if (error.response.status === 404) {
          console.log('⚠️ Commande ID 1 non trouvée (normal si pas de données)');
        } else if (error.response.status === 400) {
          console.log('⚠️ Erreur de validation (normal si commande inexistante)');
        } else {
          console.log('❌ Erreur inattendue');
        }
      } else {
        console.log('❌ Erreur de connexion:', error.message);
      }
    }
    
    // Test 3: Vérifier les routes disponibles
    console.log('\n3. Test des autres routes...');
    
    try {
      const patchResponse = await axios.patch(`${BASE_URL}/orders/1/status`, { status: 'READY' });
      console.log('✅ Route PATCH /orders/1/status fonctionne');
    } catch (error) {
      console.log('📡 Route PATCH /orders/1/status:', error.response?.status || 'Erreur connexion');
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    console.log('💡 Assurez-vous que le backend est démarré avec "npm run start"');
  }
}

// Attendre un peu que le serveur démarre
setTimeout(testOrderRoute, 3000);
