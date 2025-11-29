# 📖 Explication - Wallet Details

## 🎯 Objectif
Afficher **uniquement** les transactions du wallet spécifié (ex: Donald Trump), pas toutes les transactions de la blockchain.

---

## 🔍 Problème Résolu

### ❌ Avant (Problème)
Quand on sélectionnait Polygon, l'API retournait **toutes les transactions de Polygon**, pas seulement celles du wallet.

### ✅ Maintenant (Solution)
On filtre pour n'afficher **que les transactions du wallet** sélectionné.

---

## 📊 Sources de Données

### 1. **getWalletHistory** - Historique Complet
```javascript
moralisClient.getWalletHistory(address, chain)
```
**Ce que ça retourne :**
- Transactions natives (ETH, MATIC, etc.)
- Transactions de contrats intelligents
- Toutes les interactions du wallet

**Endpoint API :** `/wallets/{address}/history`

### 2. **getWalletTokenTransfers** - Transferts de Tokens
```javascript
moralisClient.getWalletTokenTransfers(address, chain)
```
**Ce que ça retourne :**
- Transferts ERC20 (USDC, USDT, etc.)
- Tokens reçus
- Tokens envoyés

**Endpoint API :** `/{address}/erc20/transfers`

---

## 🔧 Comment ça Fonctionne

### Étape 1 : Récupération des Données
```javascript
const [historyData, tokenTransfersData] = await Promise.allSettled([
  getWalletHistory(address, chain),      // Historique complet
  getWalletTokenTransfers(address, chain) // Transferts de tokens
]);
```

### Étape 2 : Extraction des Données
```javascript
const history = historyData.value?.result || historyData.value?.data || [];
const tokenTransfers = tokenTransfersData.value?.result || tokenTransfersData.value?.data || [];
```

### Étape 3 : Filtrage par Adresse du Wallet
```javascript
const addressLower = address.toLowerCase(); // "0x9484..." en minuscules

// Filtrer l'historique
const filteredHistory = history.filter(tx => {
  const fromAddr = tx.from_address || tx.from;
  const toAddr = tx.to_address || tx.to;
  
  return (
    fromAddr?.toLowerCase() === addressLower ||  // Wallet a envoyé
    toAddr?.toLowerCase() === addressLower      // Wallet a reçu
  );
});

// Filtrer les transferts de tokens
const filteredTokenTransfers = tokenTransfers.filter(tx => {
  const fromAddr = tx.from_address || tx.from;
  const toAddr = tx.to_address || tx.to;
  
  return (
    fromAddr?.toLowerCase() === addressLower ||  // Wallet a envoyé des tokens
    toAddr?.toLowerCase() === addressLower       // Wallet a reçu des tokens
  );
});
```

### Étape 4 : Combinaison et Déduplication
```javascript
// Combiner toutes les transactions
const allTransactions = [...filteredHistory, ...filteredTokenTransfers];

// Dédupliquer par hash (une transaction peut apparaître dans les deux sources)
const uniqueTransactions = Array.from(
  new Map(allTransactions.map(tx => [tx.hash, tx])).values()
);

// Trier par date (plus récentes en premier)
.sort((a, b) => {
  const dateA = new Date(a.block_timestamp || 0);
  const dateB = new Date(b.block_timestamp || 0);
  return dateB - dateA; // Plus récentes en premier
})
.slice(0, 100); // Limiter à 100 transactions
```

---

## 📋 Structure d'une Transaction

### Transaction Native (ETH/MATIC)
```javascript
{
  hash: "0xabc123...",           // Hash de la transaction
  from_address: "0x9484...",    // Expéditeur
  to_address: "0xdef456...",    // Destinataire
  value: "1000000000000000000",  // Valeur en wei (1 ETH = 10^18 wei)
  block_timestamp: "2024-01-15T10:30:00Z",
  category: "native",            // Type de transaction
  gas_price: "20000000000",
  gas_used: "21000"
}
```

### Transfert de Token ERC20
```javascript
{
  transaction_hash: "0xabc123...",
  from_address: "0x9484...",    // Wallet qui envoie
  to_address: "0xdef456...",     // Wallet qui reçoit
  value: "1000000",              // Quantité de tokens (avec décimales)
  token_address: "0xUSDC...",   // Adresse du contrat token
  token_name: "USD Coin",
  token_symbol: "USDC",
  block_timestamp: "2024-01-15T10:30:00Z"
}
```

---

## 🎨 Affichage dans l'Interface

### Onglet "Transactions"
Affiche toutes les transactions filtrées avec :
- **Hash** : Lien vers Polygonscan/Etherscan
- **Type** : Native, ERC20 Transfer, etc.
- **Valeur** : Montant en ETH/MATIC ou tokens
- **Date** : Date de la transaction

### Exemple d'Affichage
```
Hash: 0xabc123... → Lien Polygonscan
Type: ERC20 Transfer
Valeur: $1,234.56
Date: 15/01/2024
```

---

## 🔗 Liens vers les Explorateurs

Selon la chaîne sélectionnée, les liens pointent vers :
- **Ethereum** → Etherscan
- **Polygon** → Polygonscan
- **BSC** → BSCScan
- **Arbitrum** → Arbiscan
- **Optimism** → Optimistic Etherscan

---

## ✅ Résultat Final

**Avant :** Affichait toutes les transactions de Polygon (millions)

**Maintenant :** Affiche uniquement les transactions de `0x94845333028B1204Fbe14E1278Fd4Adde46B22ce`

**Exemple :**
- ✅ Transaction où Donald Trump a envoyé 100 USDC
- ✅ Transaction où Donald Trump a reçu 50 MATIC
- ❌ Transaction d'un autre wallet (filtrée)

---

## 🐛 Debug

Si vous voyez encore des transactions qui ne correspondent pas :

1. **Vérifiez l'adresse** : Est-ce bien `0x94845333028B1204Fbe14E1278Fd4Adde46B22ce` ?
2. **Vérifiez la chaîne** : Polygon = `0x89`
3. **Vérifiez les logs** : Ouvrez la console du navigateur (F12)
4. **Vérifiez l'API** : Les données viennent de Moralis

---

## 📝 Notes Techniques

- **Filtrage côté client** : On filtre après avoir reçu les données de l'API
- **Déduplication** : Une transaction peut apparaître dans `history` et `tokenTransfers`
- **Performance** : Limité à 100 transactions pour éviter la surcharge
- **Format de date** : Converti en format lisible (15/01/2024)


