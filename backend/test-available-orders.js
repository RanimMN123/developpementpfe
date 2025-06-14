// Script pour lister les commandes disponibles
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAvailableOrders() {
  console.log('📋 Liste des commandes disponibles');
  
  try {
    const response = await axios.get(`${BASE_URL}/orders`);
    const orders = response.data;
    
    console.log(`\n✅ ${orders.length} commande(s) trouvée(s):`);
    
    orders.forEach(order => {
      console.log(`\n📦 Commande #${order.id}`);
      console.log(`   Client: ${order.clientName}`);
      console.log(`   Statut: ${order.status}`);
      console.log(`   Responsable: ${order.responsable}`);
      console.log(`   Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      
      if (order.items && order.items.length > 0) {
        console.log(`   Articles: ${order.items.length} item(s)`);
        const total = order.items.reduce((sum, item) => {
          return sum + (item.quantity * (item.product?.price || 0));
        }, 0);
        console.log(`   Total estimé: ${total.toFixed(3)} TND`);
      }
    });
    
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log(`\n🧪 Test avec la commande #${firstOrder.id}:`);
      
      const testData = {
        status: 'DELIVERED',
        paymentMethod: 'ESPECE',
        grossAmount: 50.000,
        reduction: 0,
        netAmount: 50.000
      };
      
      try {
        const updateResponse = await axios.put(`${BASE_URL}/orders/${firstOrder.id}`, testData);
        console.log('✅ Mise à jour réussie!');
        console.log('📄 Réponse:', updateResponse.data);
      } catch (error) {
        console.log('❌ Erreur lors de la mise à jour:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data || error.message);
  }
}

setTimeout(testAvailableOrders, 1000);
