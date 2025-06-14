const fs = require('fs');
const path = require('path');

// Liste des pages à traiter
const pagesToUpdate = [
  'frontend-admin/src/app/admin/dashboard/page.tsx',
  'frontend-admin/src/app/admin/Routes/page.tsx',
  'frontend-admin/src/app/admin/users/page.tsx',
  'frontend-admin/src/app/admin/reports/page.tsx'
];

// Fonction pour ajouter l'import ScrollToTop
function addScrollToTopImport(content) {
  // Chercher les imports existants
  const importRegex = /import\s+.*from\s+['"][^'"]*['"];?\s*$/gm;
  const imports = content.match(importRegex) || [];
  
  // Vérifier si ScrollToTop est déjà importé
  if (content.includes("import ScrollToTop from '../components/ScrollToTop'")) {
    return content;
  }
  
  // Trouver le dernier import
  let lastImportIndex = -1;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = importRegex.lastIndex;
  }
  
  if (lastImportIndex !== -1) {
    // Ajouter l'import après le dernier import existant
    const beforeImport = content.substring(0, lastImportIndex);
    const afterImport = content.substring(lastImportIndex);
    
    return beforeImport + "\nimport ScrollToTop from '../components/ScrollToTop';" + afterImport;
  }
  
  return content;
}

// Fonction pour ajouter ScrollToTop avant la fermeture de PageLayout
function addScrollToTopComponent(content) {
  // Vérifier si ScrollToTop est déjà présent
  if (content.includes('<ScrollToTop />')) {
    return content;
  }
  
  // Chercher la fermeture de PageLayout
  const pageLayoutCloseRegex = /(\s*)<\/PageLayout>/;
  const match = content.match(pageLayoutCloseRegex);
  
  if (match) {
    const replacement = `${match[1]}{/* Composant de scroll amélioré */}
${match[1]}<ScrollToTop />
${match[1]}</PageLayout>`;
    
    return content.replace(pageLayoutCloseRegex, replacement);
  }
  
  return content;
}

// Fonction pour ajouter les classes de scroll aux conteneurs
function addScrollClasses(content) {
  // Ajouter les classes aux divs avec overflow
  content = content.replace(
    /className="([^"]*overflow-x-auto[^"]*)"/g,
    'className="$1 table-scroll smooth-scroll momentum-scroll"'
  );
  
  // Ajouter les classes aux tableaux
  content = content.replace(
    /className="([^"]*bg-white[^"]*rounded-lg[^"]*shadow[^"]*border[^"]*overflow-hidden[^"]*)"/g,
    'className="$1 table-scroll smooth-scroll momentum-scroll"'
  );
  
  return content;
}

// Traiter chaque page
pagesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Traitement de ${filePath}...`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Appliquer les transformations
      content = addScrollToTopImport(content);
      content = addScrollToTopComponent(content);
      content = addScrollClasses(content);
      
      // Écrire le fichier modifié
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} mis à jour avec succès`);
      
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  ${filePath} n'existe pas`);
  }
});

console.log('\n🎉 Traitement terminé !');
