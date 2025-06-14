#!/usr/bin/env node

// Script de test pour simuler une livraison et vérifier l'enregistrement automatique
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLivraisonAutomatique() {
  console.log('🚀 Test de livraison automatique avec enregistrement en caisse\n');

  try {
    // 1. Trouver une commande non livrée
    console.log('1️⃣ Recherche d\'une commande à livrer...');
    
    const commandeALivrer = await prisma.order.findFirst({
      where: {
        status: {
          not: 'DELIVERED'
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        client: true
      }
    });

    if (!commandeALivrer) {
      console.log('❌ Aucune commande non livrée trouvée');
      
      // Créer une commande de test
      console.log('🔧 Création d\'une commande de test...');
      
      const testClient = await prisma.client.findFirst();
      const testProduct = await prisma.product.findFirst();
      
      if (!testClient || !testProduct) {
        console.log('❌ Impossible de créer une commande de test (client ou produit manquant)');
        return;
      }

      const nouvelleCommande = await prisma.order.create({
        data: {
          clientId: testClient.id,
          clientName: testClient.name,
          responsable: 'Yosra', // Utilisateur de test
          status: 'READY',
          items: {
            create: [
              {
                productId: testProduct.id,
                quantity: 2
              }
            ]
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log(`✅ Commande de test créée: #${nouvelleCommande.id}`);
      commandeALivrer = nouvelleCommande;
    }

    console.log(`📦 Commande trouvée: #${commandeALivrer.id}`);
    console.log(`   Client: ${commandeALivrer.clientName}`);
    console.log(`   Responsable: ${commandeALivrer.responsable}`);
    console.log(`   Statut actuel: ${commandeALivrer.status}`);
    console.log(`   Nombre d'articles: ${commandeALivrer.items.length}`);

    // Calculer le montant total
    const montantTotal = commandeALivrer.items.reduce((total, item) => {
      return total + (item.quantity * item.product.price);
    }, 0);
    
    console.log(`   Montant total: ${montantTotal} TND`);

    // 2. Vérifier qu'aucune vente n'existe déjà
    console.log('\n2️⃣ Vérification des ventes existantes...');
    
    const venteExistante = await prisma.caisseVente.findUnique({
      where: { orderId: commandeALivrer.id }
    });

    if (venteExistante) {
      console.log('⚠️ Une vente existe déjà pour cette commande');
      console.log(`   Montant: ${venteExistante.montant} TND`);
      console.log(`   Date: ${venteExistante.dateVente}`);
    } else {
      console.log('✅ Aucune vente existante - Prêt pour le test');
    }

    // 3. Simuler la mise à jour du statut vers DELIVERED
    console.log('\n3️⃣ Simulation de la livraison...');
    console.log(`🚚 Mise à jour du statut: ${commandeALivrer.status} → DELIVERED`);

    const commandeLivree = await prisma.order.update({
      where: { id: commandeALivrer.id },
      data: { status: 'DELIVERED' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`✅ Commande #${commandeLivree.id} marquée comme livrée`);

    // 4. Simuler l'enregistrement automatique en caisse
    console.log('\n4️⃣ Simulation de l\'enregistrement automatique...');

    // Trouver l'utilisateur responsable
    const responsable = await prisma.user.findFirst({
      where: {
        OR: [
          { name: commandeLivree.responsable },
          { email: commandeLivree.responsable }
        ]
      }
    });

    if (!responsable) {
      console.log(`⚠️ Responsable non trouvé: ${commandeLivree.responsable}`);
      console.log('🔧 Création d\'un utilisateur de test...');
      
      const testUser = await prisma.user.create({
        data: {
          email: 'yosra@yahoo.com',
          password: 'test123',
          name: 'Yosra',
          role: 'Agent Commercial'
        }
      });
      
      console.log(`✅ Utilisateur de test créé: ${testUser.name} (${testUser.email})`);
      responsable = testUser;
    }

    console.log(`👤 Responsable trouvé: ${responsable.name} (${responsable.email})`);

    // Créer l'enregistrement de vente
    const venteEnCaisse = await prisma.caisseVente.create({
      data: {
        orderId: commandeLivree.id,
        userId: responsable.id,
        montant: montantTotal,
        methodePaiement: 'ESPECE',
        dateVente: new Date(),
        description: `Vente automatique - Commande #${commandeLivree.id} - Client: ${commandeLivree.clientName}`,
      }
    });

    console.log(`✅ Vente enregistrée en caisse:`, {
      id: venteEnCaisse.id,
      orderId: commandeLivree.id,
      montant: montantTotal,
      methodePaiement: venteEnCaisse.methodePaiement,
      dateVente: venteEnCaisse.dateVente
    });

    // 5. Vérifier le résultat
    console.log('\n5️⃣ Vérification du résultat...');

    const ventesUtilisateur = await prisma.caisseVente.findMany({
      where: { userId: responsable.id },
      include: {
        order: {
          select: {
            id: true,
            clientName: true,
            status: true
          }
        }
      },
      orderBy: {
        dateVente: 'desc'
      },
      take: 5
    });

    console.log(`📊 ${ventesUtilisateur.length} ventes trouvées pour ${responsable.name}:`);
    
    ventesUtilisateur.forEach(vente => {
      console.log(`   - Commande #${vente.orderId}: ${vente.montant} TND (${vente.methodePaiement})`);
      console.log(`     Client: ${vente.order.clientName}, Date: ${vente.dateVente.toLocaleString()}`);
    });

    // Calculer les statistiques du jour
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const ventesAujourdhui = await prisma.caisseVente.findMany({
      where: {
        userId: responsable.id,
        dateVente: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const totalAujourdhui = ventesAujourdhui.reduce((sum, vente) => sum + vente.montant, 0);

    console.log(`\n📈 Statistiques du jour pour ${responsable.name}:`);
    console.log(`   Nombre de ventes: ${ventesAujourdhui.length}`);
    console.log(`   Total du jour: ${totalAujourdhui} TND`);

    console.log('\n🎉 Test terminé avec succès !');
    console.log('   ✅ Commande livrée');
    console.log('   ✅ Vente enregistrée automatiquement en caisse');
    console.log('   ✅ Statistiques mises à jour');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
if (require.main === module) {
  testLivraisonAutomatique();
}

module.exports = { testLivraisonAutomatique };
