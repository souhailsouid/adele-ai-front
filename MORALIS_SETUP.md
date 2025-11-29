# Configuration Moralis API

## 📋 Prérequis

Pour utiliser les fonctionnalités crypto, vous devez avoir un compte **Moralis** et configurer votre clé API.

## 🔑 Configuration de la clé API

1. **Obtenir votre clé API Moralis** :
   - Créez un compte sur [Moralis](https://moralis.io/)
   - Accédez à votre dashboard
   - Récupérez votre clé API dans la section "API Keys"
   - Vous pouvez commencer avec le plan gratuit qui offre 2M CUs/month

2. **Ajouter la clé dans `.env.local`** :
   ```env
   NEXT_PUBLIC_MORALIS_API_KEY=votre_cle_api_ici
   ```

3. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

## 🚀 Fonctionnalités Disponibles

### 1. Wallet API
- **Balances de tokens avec prix** : Obtenez tous les tokens d'un wallet avec leurs prix en USD
  ```javascript
  import moralisClient from "/lib/moralis/client";
  const data = await moralisClient.getWalletTokenBalancesPrice(
    "0xcB1C1FdE09f811B294172696404e88E658659905",
    "0x1" // Ethereum
  );
  ```

- **NFTs d'un wallet** : Récupérez tous les NFTs d'un wallet
  ```javascript
  const nfts = await moralisClient.getWalletNFTs(address, "0x1");
  ```

- **Transactions d'un wallet** : Historique des transactions
  ```javascript
  const transactions = await moralisClient.getWalletTransactions(address, "0x1");
  ```

### 2. Token API
- **Prix d'un token** : Obtenez le prix en temps réel d'un token ERC20
  ```javascript
  const price = await moralisClient.getTokenPrice(tokenAddress, "0x1");
  ```

- **Métadonnées d'un token** : Nom, symbole, décimales, etc.
  ```javascript
  const metadata = await moralisClient.getTokenMetadata(tokenAddress, "0x1");
  ```

### 3. Price API
- **Prix d'une crypto** : Obtenez le prix d'une crypto-monnaie
  ```javascript
  const price = await moralisClient.getCryptoPrice("ETH");
  ```

### 4. NFT API
- **Métadonnées d'un NFT** : Informations détaillées sur un NFT
  ```javascript
  const nft = await moralisClient.getNFTMetadata(
    contractAddress,
    tokenId,
    "0x1"
  );
  ```

### 5. Blockchain API
- **Informations d'un bloc** : Détails d'un bloc spécifique
  ```javascript
  const block = await moralisClient.getBlock(blockNumber, "0x1");
  ```

- **Informations d'une transaction** : Détails d'une transaction
  ```javascript
  const tx = await moralisClient.getTransaction(txHash, "0x1");
  ```

### 6. Whale Tracking API 🐋
- **Détenteurs d'un token** : Obtenez tous les détenteurs d'un token avec leurs balances
  ```javascript
  const holders = await moralisClient.getTokenHolders(tokenAddress, "0x1", {
    limit: 100
  });
  ```

- **Propriétaires d'un token** : Liste des propriétaires d'un token
  ```javascript
  const owners = await moralisClient.getTokenOwners(tokenAddress, "0x1", {
    limit: 100
  });
  ```

- **Top traders pour un token** : Les traders les plus rentables pour un token
  ```javascript
  const topTraders = await moralisClient.getTopTradersForToken(tokenAddress, "0x1", {
    limit: 50
  });
  ```

- **Statistiques d'un wallet** : Statistiques détaillées d'un wallet
  ```javascript
  const stats = await moralisClient.getWalletStats(walletAddress, "0x1");
  ```

- **Valeur nette d'un wallet** : Net worth d'un wallet sur plusieurs chaînes
  ```javascript
  const netWorth = await moralisClient.getWalletNetWorth(walletAddress);
  ```

- **Données historiques des détenteurs** : Évolution des détenteurs dans le temps
  ```javascript
  const historical = await moralisClient.getHistoricalTokenHolders(
    tokenAddress,
    "0x1",
    {
      from_date: "2024-01-01",
      to_date: "2024-12-31"
    }
  );
  ```

## 🔗 Chaînes Supportées

Le client supporte plusieurs blockchains :
- **Ethereum** : `0x1`
- **Polygon** : `0x89`
- **BSC (Binance Smart Chain)** : `0x38`
- **Optimism** : `0xa`
- **Arbitrum** : `0xa4b1`

Et bien d'autres ! Consultez la [documentation officielle](https://moralis.io/supported-chains/) pour la liste complète.

## 📚 Ressources

- [Documentation Moralis](https://docs.moralis.io/)
- [API Reference](https://moralis.io/api-reference/)
- [Supported Chains](https://moralis.io/supported-chains/)
- [Pricing Plans](https://moralis.io/pricing/)

## 💡 Exemples d'Utilisation

### Page Crypto (`/dashboards/trading/crypto`)
1. Entrer une adresse de wallet
2. Sélectionner une blockchain
3. Voir tous les tokens avec leurs balances et valeurs en USD
4. Explorer les ressources et la documentation Moralis

### Page Crypto Whales (`/dashboards/trading/crypto-whales`) 🐋
1. Entrer une adresse de token
2. Sélectionner une blockchain
3. Choisir le mode d'affichage :
   - **Holders** : Tous les détenteurs du token
   - **Owners** : Propriétaires du token
   - **Top Traders** : Les traders les plus rentables
4. Voir les baleines (gros détenteurs) classées par balance
5. Explorer chaque wallet sur Etherscan/Polygonscan/etc.

## ⚠️ Notes Importantes

- La clé API doit être configurée dans `.env.local` (ne pas commiter ce fichier)
- Le client utilise l'API REST de Moralis (pas besoin d'installer le SDK)
- Respectez les limites de votre plan (2M CUs/month pour le plan gratuit)
- Les adresses de wallet doivent être au format Ethereum (0x...)

