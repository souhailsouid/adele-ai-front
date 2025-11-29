/**
 * Script pour faciliter l'ajout de baleines depuis Arkham
 * 
 * Usage:
 * 1. Allez sur https://intel.arkm.com/explorer/entity/[NOM]
 * 2. Ouvrez la console du navigateur (F12)
 * 3. Copiez-collez ce script
 * 4. Exécutez: fetchWhaleAddresses()
 * 
 * Le script extraira les adresses et les formatera pour cryptoWhales.js
 */

function fetchWhaleAddresses() {
  // Cette fonction doit être exécutée dans la console d'Arkham
  // Elle extrait les adresses de la page actuelle
  
  const addresses = [];
  const entityName = document.querySelector('h1, [data-testid="entity-name"]')?.textContent || 'Unknown Entity';
  
  // Chercher tous les liens d'adresses sur la page
  const addressLinks = document.querySelectorAll('a[href*="/address/"], a[href*="/explorer/address/"]');
  
  addressLinks.forEach(link => {
    const href = link.getAttribute('href');
    const address = href.match(/address\/([a-zA-Z0-9]+)/)?.[1];
    const text = link.textContent.trim();
    
    if (address && (address.startsWith('0x') || address.startsWith('bc1') || address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/))) {
      addresses.push({
        address: address,
        label: text,
        url: href.startsWith('http') ? href : `https://intel.arkm.com${href}`
      });
    }
  });
  
  // Dédupliquer
  const uniqueAddresses = Array.from(
    new Map(addresses.map(a => [a.address, a])).values()
  );
  
  console.log(`\n🐋 Found ${uniqueAddresses.length} addresses for ${entityName}:\n`);
  console.table(uniqueAddresses);
  
  // Générer le format pour cryptoWhales.js
  console.log('\n📋 Format pour cryptoWhales.js:\n');
  uniqueAddresses.forEach((addr, index) => {
    const chain = addr.address.startsWith('0x') ? 'ETH' : 
                  addr.address.startsWith('bc1') || addr.address.startsWith('1') || addr.address.startsWith('3') ? 'BTC' : 'ETH';
    
    console.log(`
{
  name: "${entityName} - ${addr.label || `Wallet ${index + 1}`}",
  type: "Government", // Changez selon le type
  chain: "${chain}",
  address: "${addr.address}",
  notes: "Source: Arkham Intel - ${entityName}",
},`);
  });
  
  return uniqueAddresses;
}

// Fonction helper pour formater une adresse manuellement
function formatWhaleForConfig(name, type, chain, address, notes = '') {
  return `
{
  name: "${name}",
  type: "${type}",
  chain: "${chain}",
  address: "${address}",
  notes: "${notes || `Source: Arkham Intel`}",
},`;
}

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWhaleAddresses, formatWhaleForConfig };
}

console.log(`
✅ Script chargé !

Pour utiliser:
1. Allez sur une page Arkham (ex: https://intel.arkm.com/explorer/entity/donald-trump)
2. Exécutez: fetchWhaleAddresses()
3. Copiez le format généré dans cryptoWhales.js

Ou utilisez directement:
formatWhaleForConfig("Nom", "Type", "ETH", "0x...", "Notes")
`);


