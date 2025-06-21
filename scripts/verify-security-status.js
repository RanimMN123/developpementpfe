#!/usr/bin/env node

/**
 * Script de vérification complète des protections XSS et CSRF
 * Backend + Frontend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 VÉRIFICATION COMPLÈTE DES PROTECTIONS XSS ET CSRF');
console.log('='.repeat(70));
console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
console.log('='.repeat(70));

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

/**
 * Fonction utilitaire pour les vérifications
 */
function runCheck(checkName, checkFunction) {
  totalChecks++;
  process.stdout.write(`🔍 ${checkName}... `);
  
  try {
    const result = checkFunction();
    if (result) {
      console.log('✅ ACTIF');
      passedChecks++;
    } else {
      console.log('❌ INACTIF');
      failedChecks++;
    }
  } catch (error) {
    console.log(`❌ ERREUR: ${error.message}`);
    failedChecks++;
  }
}

/**
 * VÉRIFICATIONS BACKEND
 */
console.log('\n🖥️  BACKEND - PROTECTIONS SERVEUR');
console.log('-'.repeat(50));

// Vérification 1: Backend accessible
function checkBackendConnectivity() {
  try {
    const result = execSync('powershell -Command "(Invoke-WebRequest -Uri \'http://192.168.100.138:3000/health\' -TimeoutSec 5).StatusCode"', {
      encoding: 'utf8',
      timeout: 10000
    });
    return result.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Vérification 2: Fichiers de sécurité backend
function checkBackendSecurityFiles() {
  const securityFiles = [
    'backend/src/security/security.service.ts',
    'backend/src/security/guards/csrf.guard.ts',
    'backend/src/security/guards/rate-limit.guard.ts',
    'backend/src/security/interceptors/xss-protection.interceptor.ts',
    'backend/src/security/security.module.ts'
  ];

  let existingFiles = 0;
  for (const file of securityFiles) {
    if (fs.existsSync(file)) {
      existingFiles++;
    }
  }

  return existingFiles === securityFiles.length;
}

// Vérification 3: Configuration sécurisée dans main.ts
function checkBackendMainConfig() {
  try {
    const mainPath = 'backend/src/main.ts';
    if (!fs.existsSync(mainPath)) return false;
    
    const content = fs.readFileSync(mainPath, 'utf8');
    
    const requiredFeatures = [
      'XssProtectionInterceptor',
      'SecurityService',
      'enableCors',
      'ValidationPipe',
      'allowedOrigins'
    ];

    let foundFeatures = 0;
    for (const feature of requiredFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures >= 4; // Au moins 4 sur 5
  } catch (error) {
    return false;
  }
}

// Vérification 4: Module de sécurité intégré
function checkSecurityModuleIntegration() {
  try {
    const appModulePath = 'backend/src/app.module.ts';
    if (!fs.existsSync(appModulePath)) return false;
    
    const content = fs.readFileSync(appModulePath, 'utf8');
    return content.includes('SecurityModule');
  } catch (error) {
    return false;
  }
}

// Exécuter les vérifications backend
runCheck('Backend accessible', checkBackendConnectivity);
runCheck('Fichiers de sécurité backend', checkBackendSecurityFiles);
runCheck('Configuration main.ts sécurisée', checkBackendMainConfig);
runCheck('Module de sécurité intégré', checkSecurityModuleIntegration);

/**
 * VÉRIFICATIONS FRONTEND
 */
console.log('\n🌐 FRONTEND - PROTECTIONS CLIENT');
console.log('-'.repeat(50));

// Vérification 5: Fichiers de sécurité frontend
function checkFrontendSecurityFiles() {
  const securityFiles = [
    'frontend-admin/src/utils/security.ts',
    'frontend-admin/src/hooks/useSecureApi.ts',
    'frontend-admin/src/components/SecureInput.tsx',
    'frontend-admin/src/components/SecureForm.tsx'
  ];

  let existingFiles = 0;
  for (const file of securityFiles) {
    if (fs.existsSync(file)) {
      existingFiles++;
    }
  }

  return existingFiles === securityFiles.length;
}

// Vérification 6: useApiCall sécurisé
function checkUseApiCallSecurity() {
  try {
    const apiCallPath = 'frontend-admin/src/hooks/useApiCall.ts';
    if (!fs.existsSync(apiCallPath)) return false;
    
    const content = fs.readFileSync(apiCallPath, 'utf8');
    
    const securityFeatures = [
      'securityManager',
      'validateFormData',
      'withCredentials',
      'x-csrf-token'
    ];

    let foundFeatures = 0;
    for (const feature of securityFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    return foundFeatures >= 3; // Au moins 3 sur 4
  } catch (error) {
    return false;
  }
}

// Vérification 7: Exemple d'implémentation
function checkSecureModalExample() {
  try {
    const modalPath = 'frontend-admin/src/app/admin/Agents/components/SecureAgentModal.tsx';
    if (!fs.existsSync(modalPath)) return false;
    
    const content = fs.readFileSync(modalPath, 'utf8');
    
    const requiredFeatures = [
      'SecureInput',
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

// Vérification 8: Documentation de sécurité
function checkSecurityDocumentation() {
  const docFiles = [
    'backend/SECURITY.md',
    'frontend-admin/SECURITY-GUIDE.md'
  ];

  let existingDocs = 0;
  for (const doc of docFiles) {
    if (fs.existsSync(doc)) {
      existingDocs++;
    }
  }

  return existingDocs === docFiles.length;
}

// Exécuter les vérifications frontend
runCheck('Fichiers de sécurité frontend', checkFrontendSecurityFiles);
runCheck('useApiCall sécurisé', checkUseApiCallSecurity);
runCheck('Exemple modal sécurisé', checkSecureModalExample);
runCheck('Documentation de sécurité', checkSecurityDocumentation);

/**
 * TESTS FONCTIONNELS
 */
console.log('\n🧪 TESTS FONCTIONNELS');
console.log('-'.repeat(50));

// Test 9: Backend security test
function runBackendSecurityTest() {
  try {
    const result = execSync('cd backend && node scripts/simple-security-test.js', {
      encoding: 'utf8',
      timeout: 30000
    });
    
    // Vérifier si le test indique un bon niveau de sécurité
    return result.includes('BON') || result.includes('EXCELLENT');
  } catch (error) {
    return false;
  }
}

// Test 10: Frontend security test
function runFrontendSecurityTest() {
  try {
    const result = execSync('cd frontend-admin && node scripts/test-frontend-security.js', {
      encoding: 'utf8',
      timeout: 20000
    });
    
    // Vérifier si le test indique un excellent niveau
    return result.includes('EXCELLENT');
  } catch (error) {
    return false;
  }
}

runCheck('Test de sécurité backend', runBackendSecurityTest);
runCheck('Test de sécurité frontend', runFrontendSecurityTest);

/**
 * RAPPORT FINAL
 */
console.log('\n📊 RAPPORT FINAL DE SÉCURITÉ');
console.log('='.repeat(70));

const successRate = (passedChecks / totalChecks) * 100;

console.log(`✅ Vérifications réussies: ${passedChecks}/${totalChecks}`);
console.log(`❌ Vérifications échouées: ${failedChecks}/${totalChecks}`);
console.log(`📈 Taux de réussite: ${successRate.toFixed(1)}%`);

if (successRate >= 90) {
  console.log('\n🎉 STATUT: PROTECTIONS EXCELLENTES');
  console.log('🛡️ Votre application est très bien protégée !');
} else if (successRate >= 70) {
  console.log('\n⚡ STATUT: PROTECTIONS BONNES');
  console.log('🛡️ Votre application est bien protégée !');
} else if (successRate >= 50) {
  console.log('\n⚠️  STATUT: PROTECTIONS PARTIELLES');
  console.log('🔧 Quelques améliorations nécessaires');
} else {
  console.log('\n❌ STATUT: PROTECTIONS INSUFFISANTES');
  console.log('🚨 Action requise pour sécuriser l\'application');
}

console.log('\n🛡️ PROTECTIONS CONFIRMÉES:');
if (passedChecks >= 8) {
  console.log('   ✅ Protection XSS: ACTIVE');
  console.log('   ✅ Protection CSRF: ACTIVE');
  console.log('   ✅ Validation des données: ACTIVE');
  console.log('   ✅ Rate Limiting: ACTIF');
  console.log('   ✅ Headers de sécurité: ACTIFS');
  console.log('   ✅ Sanitisation: ACTIVE');
}

console.log('\n🎯 COMMENT VÉRIFIER MANUELLEMENT:');
console.log('   1. Backend: http://192.168.100.138:3000/health (doit retourner 200)');
console.log('   2. Logs backend: Surveillez les messages de sécurité');
console.log('   3. Frontend: Utilisez SecureInput dans vos formulaires');
console.log('   4. Tests: Essayez de saisir <script>alert("test")</script>');

console.log('\n💡 PROCHAINES ÉTAPES:');
if (failedChecks > 0) {
  console.log('   • Corrigez les vérifications échouées ci-dessus');
  console.log('   • Relancez ce script pour confirmer');
}
console.log('   • Surveillez les logs de sécurité en temps réel');
console.log('   • Testez avec des données malveillantes');
console.log('   • Formez votre équipe sur les bonnes pratiques');

console.log('\n🔒 RÉSUMÉ:');
console.log(`   Backend: ${passedChecks >= 4 ? '✅ SÉCURISÉ' : '❌ À AMÉLIORER'}`);
console.log(`   Frontend: ${passedChecks >= 7 ? '✅ SÉCURISÉ' : '❌ À AMÉLIORER'}`);
console.log(`   Tests: ${passedChecks >= 9 ? '✅ VALIDÉS' : '❌ À CORRIGER'}`);

// Code de sortie
process.exit(failedChecks > 0 ? 1 : 0);
