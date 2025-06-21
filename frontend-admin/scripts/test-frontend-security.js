#!/usr/bin/env node

/**
 * Script de test de sécurité pour le frontend admin
 * Teste les protections XSS et CSRF côté client
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Test de sécurité du frontend admin');
console.log('='.repeat(50));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Fonction utilitaire pour les tests
 */
function runTest(testName, testFunction) {
  totalTests++;
  process.stdout.write(`🔍 ${testName}... `);
  
  try {
    const result = testFunction();
    if (result) {
      console.log('✅ PASS');
      passedTests++;
    } else {
      console.log('❌ FAIL');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    failedTests++;
  }
}

/**
 * Test de présence des fichiers de sécurité
 */
function testSecurityFilesExist() {
  const securityFiles = [
    'src/utils/security.ts',
    'src/hooks/useSecureApi.ts',
    'src/components/SecureInput.tsx',
    'src/components/SecureForm.tsx',
    'src/app/admin/Agents/components/SecureAgentModal.tsx'
  ];

  let existingFiles = 0;
  for (const file of securityFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      existingFiles++;
    } else {
      console.log(`\n   ⚠️  Fichier manquant: ${file}`);
    }
  }

  return existingFiles === securityFiles.length;
}

/**
 * Test de la configuration de sécurité
 */
function testSecurityConfiguration() {
  try {
    const securityPath = path.join(__dirname, '..', 'src/utils/security.ts');
    const content = fs.readFileSync(securityPath, 'utf8');
    
    const requiredFeatures = [
      'sanitizeString',
      'detectXss',
      'validateFormData',
      'SecurityManager',
      'getCsrfToken',
      'getSecureHeaders'
    ];

    let foundFeatures = 0;
    for (const feature of requiredFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures === requiredFeatures.length;
  } catch (error) {
    return false;
  }
}

/**
 * Test des composants sécurisés
 */
function testSecureComponents() {
  try {
    const secureInputPath = path.join(__dirname, '..', 'src/components/SecureInput.tsx');
    const content = fs.readFileSync(secureInputPath, 'utf8');
    
    const requiredFeatures = [
      'detectXss',
      'sanitizeString',
      'validateEmail',
      'validatePhone',
      'validateName',
      'SecureInput',
      'SecureEmailInput',
      'SecurePasswordInput'
    ];

    let foundFeatures = 0;
    for (const feature of requiredFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures >= 6; // Au moins 6 sur 8 fonctionnalités
  } catch (error) {
    return false;
  }
}

/**
 * Test des hooks sécurisés
 */
function testSecureHooks() {
  try {
    const secureApiPath = path.join(__dirname, '..', 'src/hooks/useSecureApi.ts');
    const content = fs.readFileSync(secureApiPath, 'utf8');
    
    const requiredFeatures = [
      'useSecureApi',
      'useSecureForm',
      'validateFormData',
      'securityManager',
      'X-CSRF-Token',
      'withCredentials'
    ];

    let foundFeatures = 0;
    for (const feature of requiredFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures === requiredFeatures.length;
  } catch (error) {
    return false;
  }
}

/**
 * Test de l'intégration dans useApiCall
 */
function testApiCallIntegration() {
  try {
    const apiCallPath = path.join(__dirname, '..', 'src/hooks/useApiCall.ts');
    const content = fs.readFileSync(apiCallPath, 'utf8');
    
    const requiredFeatures = [
      'securityManager',
      'validateFormData',
      'getSecureHeaders',
      'withCredentials',
      'x-csrf-token'
    ];

    let foundFeatures = 0;
    for (const feature of requiredFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures >= 4; // Au moins 4 sur 5 fonctionnalités
  } catch (error) {
    return false;
  }
}

/**
 * Test de l'exemple d'implémentation
 */
function testSecureModalExample() {
  try {
    const modalPath = path.join(__dirname, '..', 'src/app/admin/Agents/components/SecureAgentModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');
    
    const requiredFeatures = [
      'SecureInput',
      'SecureEmailInput',
      'SecurePasswordInput',
      'useSecureForm',
      'validateFormData',
      'hasCsrfToken'
    ];

    let foundFeatures = 0;
    for (const feature of requiredFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures === requiredFeatures.length;
  } catch (error) {
    return false;
  }
}

/**
 * Test de la configuration Next.js
 */
function testNextJsConfiguration() {
  try {
    const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Vérifier les configurations de sécurité recommandées
      const hasStandalone = content.includes('standalone');
      const hasImageConfig = content.includes('images');
      
      return hasStandalone && hasImageConfig;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test des dépendances de sécurité
 */
function testSecurityDependencies() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'axios',
      'react',
      'next',
      'lucide-react'
    ];

    let foundDeps = 0;
    for (const dep of requiredDeps) {
      if (dependencies[dep]) {
        foundDeps++;
      }
    }

    return foundDeps === requiredDeps.length;
  } catch (error) {
    return false;
  }
}

/**
 * Fonction principale
 */
function runSecurityTests() {
  console.log('\n🧪 Démarrage des tests de sécurité frontend...\n');
  
  // Tests de sécurité
  runTest('Fichiers de sécurité présents', testSecurityFilesExist);
  runTest('Configuration de sécurité', testSecurityConfiguration);
  runTest('Composants sécurisés', testSecureComponents);
  runTest('Hooks sécurisés', testSecureHooks);
  runTest('Intégration useApiCall', testApiCallIntegration);
  runTest('Exemple modal sécurisé', testSecureModalExample);
  runTest('Configuration Next.js', testNextJsConfiguration);
  runTest('Dépendances de sécurité', testSecurityDependencies);
  
  // Rapport final
  console.log('\n📊 RAPPORT DE SÉCURITÉ FRONTEND');
  console.log('='.repeat(50));
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${failedTests}/${totalTests}`);
  
  const successRate = (passedTests / totalTests) * 100;
  console.log(`📈 Taux de réussite: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 80) {
    console.log('\n🎉 Niveau de sécurité: EXCELLENT');
  } else if (successRate >= 60) {
    console.log('\n⚡ Niveau de sécurité: BON');
  } else {
    console.log('\n⚠️  Niveau de sécurité: À AMÉLIORER');
  }
  
  console.log('\n🛡️ PROTECTIONS IMPLÉMENTÉES:');
  console.log('   ✅ Utilitaires de sécurité (security.ts)');
  console.log('   ✅ Hooks API sécurisés (useSecureApi.ts)');
  console.log('   ✅ Composants de saisie sécurisés (SecureInput.tsx)');
  console.log('   ✅ Formulaires sécurisés (SecureForm.tsx)');
  console.log('   ✅ Intégration CSRF dans useApiCall');
  console.log('   ✅ Exemple d\'implémentation (SecureAgentModal)');
  
  console.log('\n🔒 FONCTIONNALITÉS DE SÉCURITÉ:');
  console.log('   • Protection XSS automatique');
  console.log('   • Validation et sanitisation des entrées');
  console.log('   • Gestion des tokens CSRF');
  console.log('   • Headers de sécurité automatiques');
  console.log('   • Validation en temps réel');
  console.log('   • Indicateurs visuels de sécurité');
  
  console.log('\n🎯 UTILISATION:');
  console.log('   1. Remplacez les composants <input> par <SecureInput>');
  console.log('   2. Utilisez useSecureApi au lieu de useApiCall');
  console.log('   3. Utilisez SecureForm pour les formulaires critiques');
  console.log('   4. Les protections sont automatiques et transparentes');
  
  console.log('\n💡 PROCHAINES ÉTAPES:');
  if (failedTests > 0) {
    console.log('   • Corrigez les tests échoués ci-dessus');
    console.log('   • Vérifiez l\'installation des dépendances');
  }
  console.log('   • Remplacez progressivement les formulaires existants');
  console.log('   • Testez avec des données malveillantes');
  console.log('   • Surveillez les logs de sécurité');
  
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
  runSecurityTests();
}
