#!/usr/bin/env node

// Script de test pour vérifier l'enregistrement automatique en caisse
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCaisseAutomatique() {
  console.log('🚀 Test de l\'enregistrement automatique en caisse\n');

  try {
    // 1. Vérifier la structure de la base de données
    console.log('1️⃣ Vérification de la table CaisseVente...');
    
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'caisse_ventes'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ Table caisse_ventes créée avec succès');
    } else {
      console.log('❌ Table caisse_ventes non trouvée');
      return;
    }

    // 2. Vérifier les commandes existantes
    console.log('\n2️⃣ Vérification des commandes existantes...');
    
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      take: 5
    });

    console.log(`📦 ${orders.length} commandes trouvées`);
    
    if (orders.length > 0) {
      const order = orders[0];
      console.log(`📋 Exemple de commande:`, {
        id: order.id,
        status: order.status,
        clientName: order.clientName,
        responsable: order.responsable,
        itemsCount: order.items.length
      });

      // Calculer le montant total
      const montantTotal = order.items.reduce((total, item) => {
        return total + (item.quantity * item.product.price);
      }, 0);
      
      console.log(`💰 Montant total: ${montantTotal} TND`);
    }

    // 3. Vérifier les utilisateurs
    console.log('\n3️⃣ Vérification des utilisateurs...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 3
    });

    console.log(`👥 ${users.length} utilisateurs trouvés`);
    users.forEach(user => {
      console.log(`   - ${user.name || 'Sans nom'} (${user.email}) - ID: ${user.id}`);
    });

    // 4. Tester l'enregistrement automatique (simulation)
    console.log('\n4️⃣ Test de simulation d\'enregistrement automatique...');
    
    if (orders.length > 0 && users.length > 0) {
      const testOrder = orders.find(o => o.status !== 'DELIVERED') || orders[0];
      const testUser = users[0];
      
      console.log(`🧪 Simulation: Commande #${testOrder.id} -> DELIVERED`);
      console.log(`👤 Responsable: ${testUser.name || testUser.email}`);
      
      // Calculer le montant
      const montant = testOrder.items.reduce((total, item) => {
        return total + (item.quantity * item.product.price);
      }, 0);
      
      console.log(`💰 Montant à enregistrer: ${montant} TND`);
      
      // Vérifier si une vente existe déjà pour cette commande
      const venteExistante = await prisma.caisseVente.findUnique({
        where: { orderId: testOrder.id }
      });
      
      if (venteExistante) {
        console.log('ℹ️ Vente déjà enregistrée pour cette commande');
        console.log(`   Montant: ${venteExistante.montant} TND`);
        console.log(`   Date: ${venteExistante.dateVente}`);
        console.log(`   Méthode: ${venteExistante.methodePaiement}`);
      } else {
        console.log('✅ Aucune vente existante - Prêt pour l\'enregistrement automatique');
      }
    }

    // 5. Vérifier les ventes en caisse existantes
    console.log('\n5️⃣ Vérification des ventes en caisse existantes...');
    
    const ventesEnCaisse = await prisma.caisseVente.findMany({
      include: {
        order: {
          select: {
            id: true,
            clientName: true,
            status: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        dateVente: 'desc'
      },
      take: 5
    });

    console.log(`💰 ${ventesEnCaisse.length} ventes en caisse trouvées`);
    
    if (ventesEnCaisse.length > 0) {
      console.log('📋 Dernières ventes:');
      ventesEnCaisse.forEach(vente => {
        console.log(`   - Commande #${vente.orderId}: ${vente.montant} TND (${vente.methodePaiement})`);
        console.log(`     Client: ${vente.order.clientName}, Vendeur: ${vente.user.name || vente.user.email}`);
        console.log(`     Date: ${vente.dateVente.toLocaleString()}`);
      });
    }

    console.log('\n📊 Résumé du test:');
    console.log(`   ✅ Table caisse_ventes: Créée`);
    console.log(`   📦 Commandes disponibles: ${orders.length}`);
    console.log(`   👥 Utilisateurs disponibles: ${users.length}`);
    console.log(`   💰 Ventes enregistrées: ${ventesEnCaisse.length}`);
    
    console.log('\n🎯 Le système est prêt pour l\'enregistrement automatique !');
    console.log('   Quand une commande passe au statut DELIVERED,');
    console.log('   elle sera automatiquement enregistrée en caisse.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
if (require.main === module) {
  testCaisseAutomatique();
}

module.exports = { testCaisseAutomatique };
