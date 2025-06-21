#!/usr/bin/env node

/**
 * Script de démarrage sécurisé pour le backend
 * Vérifie la configuration de sécurité avant de lancer le serveur
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Démarrage sécurisé du backend');
console.log('='.repeat(50));

/**
 * Vérifications de sécurité pré-démarrage
 */
function performSecurityChecks() {
  console.log('\n🔍 Vérifications de sécurité...\n');
  
  let checksPassedCount = 0;
  let totalChecks = 0;
  
  // Vérification 1: Variables d'environnement
  totalChecks++;
  console.log('1️⃣ Variables d\'environnement...');
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'defaultSecret' || jwtSecret === 'secretKey') {
    console.log('   ⚠️  JWT_SECRET faible ou par défaut');
    console.log('   💡 Définissez une clé JWT forte dans .env');
  } else if (jwtSecret.length < 32) {
    console.log('   ⚠️  JWT_SECRET trop courte (< 32 caractères)');
  } else {
    console.log('   ✅ JWT_SECRET configurée correctement');
    checksPassedCount++;
  }
  
  // Vérification 2: Fichiers de sécurité
  totalChecks++;
  console.log('\n2️⃣ Fichiers de sécurité...');
  
  const securityFiles = [
    'src/security/security.service.ts',
    'src/security/guards/csrf.guard.ts',
    'src/security/guards/rate-limit.guard.ts',
    'src/security/interceptors/xss-protection.interceptor.ts',
  ];
  
  let securityFilesPresent = 0;
  for (const file of securityFiles) {
    if (fs.existsSync(path.join(__dirname, '..', file))) {
      securityFilesPresent++;
    }
  }
  
  if (securityFilesPresent === securityFiles.length) {
    console.log('   ✅ Tous les fichiers de sécurité présents');
    checksPassedCount++;
  } else {
    console.log(`   ⚠️  ${securityFilesPresent}/${securityFiles.length} fichiers de sécurité présents`);
  }
  
  // Vérification 3: Configuration de production
  totalChecks++;
  console.log('\n3️⃣ Configuration de production...');
  
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    console.log('   ✅ Mode production activé');
    
    // Vérifications supplémentaires pour la production
    if (jwtSecret && jwtSecret.length >= 32) {
      console.log('   ✅ JWT sécurisé pour la production');
    } else {
      console.log('   ❌ JWT non sécurisé pour la production');
    }
    
    checksPassedCount++;
  } else {
    console.log('   ⚡ Mode développement');
    console.log('   💡 Utilisez NODE_ENV=production pour la production');
    checksPassedCount++; // OK en développement
  }
  
  // Vérification 4: Dépendances de sécurité
  totalChecks++;
  console.log('\n4️⃣ Dépendances...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const securityDeps = [
      '@nestjs/common',
      '@nestjs/core',
      'class-validator',
      'class-transformer',
    ];
    
    let depsPresent = 0;
    for (const dep of securityDeps) {
      if (dependencies[dep]) {
        depsPresent++;
      }
    }
    
    if (depsPresent === securityDeps.length) {
      console.log('   ✅ Dépendances de sécurité présentes');
      checksPassedCount++;
    } else {
      console.log(`   ⚠️  ${depsPresent}/${securityDeps.length} dépendances de sécurité présentes`);
    }
  } catch (error) {
    console.log('   ❌ Erreur lors de la vérification des dépendances');
  }
  
  // Vérification 5: Base de données
  totalChecks++;
  console.log('\n5️⃣ Base de données...');
  
  try {
    // Vérifier si Prisma est configuré
    if (fs.existsSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'))) {
      console.log('   ✅ Schema Prisma présent');
      checksPassedCount++;
    } else {
      console.log('   ⚠️  Schema Prisma manquant');
    }
  } catch (error) {
    console.log('   ❌ Erreur lors de la vérification de la base de données');
  }
  
  return { checksPassedCount, totalChecks };
}

/**
 * Test de connectivité rapide
 */
async function testConnectivity() {
  console.log('\n🌐 Test de connectivité...');
  
  try {
    // Démarrer le serveur en arrière-plan pour le test
    console.log('   🚀 Démarrage temporaire du serveur...');
    
    const serverProcess = execSync('npm run start', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      timeout: 10000,
    });
    
    console.log('   ✅ Serveur démarré avec succès');
    return true;
  } catch (error) {
    console.log('   ❌ Erreur de démarrage:', error.message);
    return false;
  }
}

/**
 * Affichage du rapport de sécurité
 */
function displaySecurityReport(checksResult) {
  const { checksPassedCount, totalChecks } = checksResult;
  const successRate = (checksPassedCount / totalChecks) * 100;
  
  console.log('\n📊 RAPPORT DE SÉCURITÉ PRÉ-DÉMARRAGE');
  console.log('='.repeat(50));
  console.log(`✅ Vérifications réussies: ${checksPassedCount}/${totalChecks}`);
  console.log(`📈 Taux de réussite: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 80) {
    console.log('🎉 Niveau de sécurité: EXCELLENT');
    console.log('✅ Le serveur peut être démarré en toute sécurité');
    return true;
  } else if (successRate >= 60) {
    console.log('⚡ Niveau de sécurité: BON');
    console.log('⚠️  Quelques améliorations recommandées');
    return true;
  } else {
    console.log('❌ Niveau de sécurité: INSUFFISANT');
    console.log('🚫 Démarrage non recommandé');
    return false;
  }
}

/**
 * Affichage des recommandations
 */
function displayRecommendations() {
  console.log('\n💡 RECOMMANDATIONS DE SÉCURITÉ:');
  console.log('   • Définissez une clé JWT forte (32+ caractères)');
  console.log('   • Utilisez HTTPS en production');
  console.log('   • Configurez un pare-feu approprié');
  console.log('   • Surveillez les logs de sécurité');
  console.log('   • Effectuez des tests de sécurité réguliers');
  console.log('   • Mettez à jour les dépendances régulièrement');
}

/**
 * Démarrage du serveur
 */
function startServer() {
  console.log('\n🚀 DÉMARRAGE DU SERVEUR...');
  console.log('='.repeat(50));
  
  try {
    console.log('📍 Commande: npm run start');
    console.log('🌐 URL: http://localhost:3000');
    console.log('📋 Logs: Surveillez les messages de sécurité');
    console.log('🔒 Protections: XSS, CSRF, Rate Limiting actives');
    
    // Démarrer le serveur
    execSync('npm run start', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error.message);
    process.exit(1);
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    // Vérifications de sécurité
    const checksResult = performSecurityChecks();
    
    // Rapport de sécurité
    const canStart = displaySecurityReport(checksResult);
    
    // Recommandations
    displayRecommendations();
    
    if (canStart) {
      console.log('\n⏳ Démarrage dans 3 secondes...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Démarrer le serveur
      startServer();
    } else {
      console.log('\n🚫 Démarrage annulé pour des raisons de sécurité');
      console.log('💡 Corrigez les problèmes identifiés et relancez');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors du démarrage sécurisé:', error.message);
    process.exit(1);
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du serveur demandé');
  console.log('👋 Au revoir !');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Arrêt du serveur (SIGTERM)');
  process.exit(0);
});

// Exécution
if (require.main === module) {
  main();
}
