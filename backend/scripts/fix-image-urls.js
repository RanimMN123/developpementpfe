#!/usr/bin/env node

/**
 * Script pour corriger les URLs d'images dans la base de données
 * Remplace localhost par l'IP actuelle ou supprime les URLs complètes
 */

const { PrismaClient } = require('@prisma/client');
const os = require('os');

const prisma = new PrismaClient();

// Fonction pour détecter l'IP locale
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost'; // Fallback pour production
}

async function fixImageUrls() {
  console.log('🔧 === CORRECTION DES URLs D\'IMAGES ===\n');

  const currentIP = getLocalIP();
  console.log(`📡 IP détectée: ${currentIP}\n`);

  try {
    // 1. Corriger les URLs des produits
    console.log('📦 1. Correction des URLs de produits...');
    
    const products = await prisma.product.findMany({
      where: {
        imageUrl: {
          contains: 'localhost:3000'
        }
      }
    });

    console.log(`   Trouvé ${products.length} produits avec URLs localhost`);

    for (const product of products) {
      const oldUrl = product.imageUrl;
      
      // Option 1: Remplacer localhost par IP actuelle
      // const newUrl = oldUrl.replace(/localhost:3000|127\.0\.0\.1:3000/, `${currentIP}:3000`);
      
      // Option 2: Convertir en chemin relatif (RECOMMANDÉ)
      const urlMatch = oldUrl.match(/http:\/\/[^\/]+(.+)/);
      const newUrl = urlMatch ? urlMatch[1] : oldUrl;

      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: newUrl }
      });

      console.log(`   ✅ Produit ${product.id}: ${oldUrl} → ${newUrl}`);
    }

    // 2. Vérifier les catégories (normalement pas de problème)
    console.log('\n📂 2. Vérification des URLs de catégories...');
    
    const categories = await prisma.category.findMany({
      where: {
        image: {
          contains: 'localhost:3000'
        }
      }
    });

    console.log(`   Trouvé ${categories.length} catégories avec URLs localhost`);

    for (const category of categories) {
      const oldUrl = category.image;
      const urlMatch = oldUrl.match(/http:\/\/[^\/]+(.+)/);
      const newUrl = urlMatch ? urlMatch[1] : oldUrl;

      await prisma.category.update({
        where: { id: category.id },
        data: { image: newUrl }
      });

      console.log(`   ✅ Catégorie ${category.id}: ${oldUrl} → ${newUrl}`);
    }

    // 3. Statistiques finales
    console.log('\n📊 3. Statistiques finales...');
    
    const totalProducts = await prisma.product.count();
    const productsWithLocalhost = await prisma.product.count({
      where: {
        imageUrl: {
          contains: 'localhost:3000'
        }
      }
    });

    const totalCategories = await prisma.category.count();
    const categoriesWithLocalhost = await prisma.category.count({
      where: {
        image: {
          contains: 'localhost:3000'
        }
      }
    });

    console.log(`   📦 Produits: ${totalProducts} total, ${productsWithLocalhost} avec localhost restant`);
    console.log(`   📂 Catégories: ${totalCategories} total, ${categoriesWithLocalhost} avec localhost restant`);

    if (productsWithLocalhost === 0 && categoriesWithLocalhost === 0) {
      console.log('\n🎉 SUCCÈS ! Toutes les URLs localhost ont été corrigées !');
    } else {
      console.log('\n⚠️ Il reste des URLs localhost à corriger manuellement');
    }

    console.log('\n💡 Recommandations:');
    console.log('   1. Redémarrez l\'app mobile pour voir les changements');
    console.log('   2. Les images devraient maintenant s\'afficher correctement');
    console.log('   3. Les nouvelles images utilisent automatiquement le bon format');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour afficher les URLs actuelles (diagnostic)
async function showCurrentUrls() {
  console.log('🔍 === DIAGNOSTIC DES URLs ACTUELLES ===\n');

  try {
    // Produits
    const products = await prisma.product.findMany({
      select: { id: true, name: true, imageUrl: true },
      take: 5
    });

    console.log('📦 Exemples d\'URLs de produits:');
    products.forEach(p => {
      console.log(`   ${p.id}: ${p.name} → ${p.imageUrl}`);
    });

    // Catégories
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, image: true }
    });

    console.log('\n📂 URLs de catégories:');
    categories.forEach(c => {
      console.log(`   ${c.id}: ${c.name} → ${c.image}`);
    });

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--show') || args.includes('-s')) {
    await showCurrentUrls();
  } else if (args.includes('--fix') || args.includes('-f')) {
    await fixImageUrls();
  } else {
    console.log('🔧 Script de correction des URLs d\'images\n');
    console.log('Usage:');
    console.log('  node fix-image-urls.js --show    # Afficher les URLs actuelles');
    console.log('  node fix-image-urls.js --fix     # Corriger les URLs localhost');
    console.log('\nRecommandation: Exécutez d\'abord --show pour voir l\'état actuel');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixImageUrls, showCurrentUrls };
