#!/usr/bin/env node

/**
 * Script pour obtenir l'adresse IP actuelle du PC
 * Utile pour configurer le mobile
 */

const os = require('os');
const { execSync } = require('child_process');

console.log('🔍 DÉTECTION DE L\'ADRESSE IP ACTUELLE');
console.log('='.repeat(50));

/**
 * Obtenir toutes les interfaces réseau
 */
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const results = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const addr of addresses) {
      // Ignorer les adresses de loopback et non-IPv4
      if (addr.family === 'IPv4' && !addr.internal) {
        results.push({
          interface: name,
          address: addr.address,
          netmask: addr.netmask,
          mac: addr.mac
        });
      }
    }
  }

  return results;
}

/**
 * Détecter l'interface active (avec accès Internet)
 */
function getActiveInterface() {
  try {
    // Essayer de ping Google pour détecter l'interface active
    const result = execSync('ping -n 1 8.8.8.8', { encoding: 'utf8', timeout: 5000 });
    
    // Extraire l'IP source utilisée
    const interfaces = getNetworkInterfaces();
    
    // Retourner la première interface non-loopback
    return interfaces.find(iface => 
      iface.address.startsWith('192.168.') || 
      iface.address.startsWith('10.') || 
      iface.address.startsWith('172.')
    );
  } catch (error) {
    // En cas d'erreur, retourner la première interface trouvée
    const interfaces = getNetworkInterfaces();
    return interfaces[0];
  }
}

/**
 * Fonction principale
 */
function main() {
  const interfaces = getNetworkInterfaces();
  const activeInterface = getActiveInterface();

  console.log('📡 Interfaces réseau détectées:');
  console.log('-'.repeat(30));

  if (interfaces.length === 0) {
    console.log('❌ Aucune interface réseau active trouvée');
    return;
  }

  interfaces.forEach((iface, index) => {
    const isActive = activeInterface && iface.address === activeInterface.address;
    const marker = isActive ? '🟢' : '⚪';
    
    console.log(`${marker} ${iface.interface}`);
    console.log(`   IP: ${iface.address}`);
    console.log(`   Masque: ${iface.netmask}`);
    console.log(`   MAC: ${iface.mac}`);
    
    if (isActive) {
      console.log('   ✅ INTERFACE ACTIVE');
    }
    console.log('');
  });

  if (activeInterface) {
    console.log('🎯 CONFIGURATION RECOMMANDÉE POUR LE MOBILE:');
    console.log('='.repeat(50));
    console.log(`📱 IP du PC: ${activeInterface.address}`);
    console.log(`🖥️  Backend: http://${activeInterface.address}:3000`);
    console.log(`🌐 Frontend: http://${activeInterface.address}:3001`);
    console.log('');

    // Déterminer le type de réseau
    const ip = activeInterface.address;
    let networkType = 'Inconnu';
    let suggestedStaticIP = '';

    if (ip.startsWith('192.168.1.')) {
      networkType = 'Réseau domestique standard (192.168.1.x)';
      suggestedStaticIP = '192.168.1.100';
    } else if (ip.startsWith('192.168.0.')) {
      networkType = 'Réseau domestique alternatif (192.168.0.x)';
      suggestedStaticIP = '192.168.0.100';
    } else if (ip.startsWith('10.')) {
      networkType = 'Réseau d\'entreprise (10.x.x.x)';
      suggestedStaticIP = ip.substring(0, ip.lastIndexOf('.')) + '.100';
    } else if (ip.startsWith('172.')) {
      networkType = 'Réseau privé (172.x.x.x)';
      suggestedStaticIP = ip.substring(0, ip.lastIndexOf('.')) + '.100';
    }

    console.log(`🏠 Type de réseau: ${networkType}`);
    console.log(`💡 IP statique suggérée: ${suggestedStaticIP}`);
    console.log('');

    // Générer la configuration pour le mobile
    console.log('📋 CONFIGURATION MOBILE:');
    console.log('-'.repeat(30));
    console.log('Copiez cette configuration dans votre application mobile:');
    console.log('');
    console.log(`BASE_URL: "http://${activeInterface.address}:3000"`);
    console.log('');

    // Tester la connectivité du backend
    console.log('🧪 TEST DE CONNECTIVITÉ:');
    console.log('-'.repeat(30));
    
    try {
      const testResult = execSync(`powershell -Command "(Invoke-WebRequest -Uri 'http://${activeInterface.address}:3000/health' -TimeoutSec 5).StatusCode"`, {
        encoding: 'utf8',
        timeout: 10000
      });
      
      if (testResult.trim() === '200') {
        console.log('✅ Backend accessible et fonctionnel');
      } else {
        console.log('⚠️  Backend répond mais statut inattendu:', testResult.trim());
      }
    } catch (error) {
      console.log('❌ Backend non accessible');
      console.log('💡 Assurez-vous que le backend est démarré: npm run start');
    }

  } else {
    console.log('❌ Impossible de détecter l\'interface active');
  }

  console.log('');
  console.log('💡 CONSEILS:');
  console.log('• Pour une IP fixe, utilisez: scripts/setup-fixed-ip.bat');
  console.log('• Pour vérifier manuellement: ipconfig');
  console.log('• Redémarrez ce script après changement de réseau');
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

// Exécution
if (require.main === module) {
  main();
}
