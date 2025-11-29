/**
 * Client API Moralis
 * Documentation: https://docs.moralis.io/
 */

class MoralisClient {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
    this.baseUrl = "https://deep-index.moralis.io/api/v2.2";
    
    if (!this.apiKey) {
      console.warn("⚠️ MORALIS_API_KEY not configured. Crypto features may not work.");
    }
  }

  /**
   * Faire une requête à l'API Moralis
   */
  async request(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error("Moralis API key not configured");
    }

    const queryParams = new URLSearchParams({
      ...params,
    });

    const url = `${this.baseUrl}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Moralis API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== WALLET API ====================

  /**
   * Obtenir les balances de tokens d'un wallet avec prix
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain (0x1 pour Ethereum, 0x89 pour Polygon, etc.)
   */
  async getWalletTokenBalancesPrice(address, chain = "0x1") {
    return this.request(`/wallets/${address}/tokens`, {
      chain,
    });
  }

  /**
   * Obtenir les NFTs d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletNFTs(address, chain = "0x1") {
    return this.request(`/${address}/nft`, {
      chain,
    });
  }

  /**
   * Obtenir les transactions d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletTransactions(address, chain = "0x1") {
    return this.request(`/${address}/verbose`, {
      chain,
    });
  }

  // ==================== TOKEN API ====================

  /**
   * Obtenir le prix d'un token
   * @param {string} address - Adresse du token
   * @param {string} chain - Chaîne blockchain
   */
  async getTokenPrice(address, chain = "0x1") {
    return this.request(`/erc20/${address}/price`, {
      chain,
    });
  }

  /**
   * Obtenir les métadonnées d'un token
   * @param {string} address - Adresse du token
   * @param {string} chain - Chaîne blockchain
   */
  async getTokenMetadata(address, chain = "0x1") {
    return this.request(`/erc20/metadata`, {
      chain,
      addresses: address,
    });
  }

  // ==================== PRICE API ====================

  /**
   * Obtenir le prix d'une crypto-monnaie
   * @param {string} symbol - Symbole de la crypto (ex: "ETH", "BTC")
   */
  async getCryptoPrice(symbol) {
    return this.request(`/erc20/${symbol}/price`);
  }

  /**
   * Obtenir les prix de plusieurs cryptos
   * @param {Array<string>} symbols - Tableau de symboles
   */
  async getMultipleCryptoPrices(symbols) {
    const promises = symbols.map((symbol) => 
      this.getCryptoPrice(symbol).catch(() => null)
    );
    return Promise.all(promises);
  }

  // ==================== NFT API ====================

  /**
   * Obtenir les métadonnées d'un NFT
   * @param {string} address - Adresse du contrat NFT
   * @param {string} tokenId - ID du token
   * @param {string} chain - Chaîne blockchain
   */
  async getNFTMetadata(address, tokenId, chain = "0x1") {
    return this.request(`/nft/${address}/${tokenId}`, {
      chain,
    });
  }

  // ==================== BLOCKCHAIN API ====================

  /**
   * Obtenir les informations d'un bloc
   * @param {string} blockNumberOrHash - Numéro ou hash du bloc
   * @param {string} chain - Chaîne blockchain
   */
  async getBlock(blockNumberOrHash, chain = "0x1") {
    return this.request(`/block/${blockNumberOrHash}`, {
      chain,
    });
  }

  /**
   * Obtenir les informations d'une transaction
   * @param {string} transactionHash - Hash de la transaction
   * @param {string} chain - Chaîne blockchain
   */
  async getTransaction(transactionHash, chain = "0x1") {
    return this.request(`/transaction/${transactionHash}`, {
      chain,
    });
  }

  // ==================== WHALE TRACKING API ====================

  /**
   * Obtenir les détenteurs d'un token (holders summary)
   * @param {string} tokenAddress - Adresse du token
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options supplémentaires (limit, cursor, etc.)
   */
  async getTokenHolders(tokenAddress, chain = "0x1", options = {}) {
    return this.request(`/erc20/${tokenAddress}/holders`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les propriétaires d'un token (owners)
   * @param {string} tokenAddress - Adresse du token
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options supplémentaires (limit, cursor, etc.)
   */
  async getTokenOwners(tokenAddress, chain = "0x1", options = {}) {
    return this.request(`/erc20/${tokenAddress}/owners`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les statistiques d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletStats(address, chain = "0x1") {
    return this.request(`/wallets/${address}/stats`, {
      chain,
    });
  }

  /**
   * Obtenir la valeur nette d'un wallet (net worth)
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain (optionnel, peut être un tableau)
   */
  async getWalletNetWorth(address, chain = null) {
    const params = chain ? { chain } : {};
    return this.request(`/wallets/${address}/net-worth`, params);
  }

  /**
   * Obtenir les données historiques des détenteurs d'un token
   * @param {string} tokenAddress - Adresse du token
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (from_date, to_date, etc.)
   */
  async getHistoricalTokenHolders(tokenAddress, chain = "0x1", options = {}) {
    return this.request(`/erc20/${tokenAddress}/holders/historical`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les top traders pour un token (top gainers)
   * @param {string} tokenAddress - Adresse du token
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, etc.)
   */
  async getTopTradersForToken(tokenAddress, chain = "0x1", options = {}) {
    return this.request(`/erc20/${tokenAddress}/top-gainers`, {
      chain,
      ...options,
    });
  }

  // ==================== WALLET DETAILS API ====================

  /**
   * Obtenir l'historique complet d'un wallet (comme Arkham)
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletHistory(address, chain = "0x1") {
    return this.request(`/wallets/${address}/history`, {
      chain,
    });
  }

  /**
   * Obtenir les NFTs d'un wallet avec métadonnées
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, cursor, etc.)
   */
  async getWalletNFTs(address, chain = "0x1", options = {}) {
    return this.request(`/${address}/nft`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les collections NFT d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletNFTCollections(address, chain = "0x1") {
    return this.request(`/${address}/nft/collections`, {
      chain,
    });
  }

  /**
   * Obtenir les positions DeFi d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletDefiPositions(address, chain = "0x1") {
    return this.request(`/wallets/${address}/defi/positions`, {
      chain,
    });
  }

  /**
   * Obtenir le résumé DeFi d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletDefiSummary(address, chain = "0x1") {
    return this.request(`/wallets/${address}/defi/summary`, {
      chain,
    });
  }

  /**
   * Obtenir les swaps d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, etc.)
   */
  async getWalletSwaps(address, chain = "0x1", options = {}) {
    return this.request(`/wallets/${address}/swaps`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les transactions décodées d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, cursor, etc.)
   */
  async getWalletTransactionsVerbose(address, chain = "0x1", options = {}) {
    return this.request(`/${address}/verbose`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les transferts de tokens ERC20 d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, cursor, etc.)
   */
  async getWalletTokenTransfers(address, chain = "0x1", options = {}) {
    return this.request(`/${address}/erc20/transfers`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les transferts NFT d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, cursor, etc.)
   */
  async getWalletNFTTransfers(address, chain = "0x1", options = {}) {
    return this.request(`/${address}/nft/transfers`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les trades NFT d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   * @param {Object} options - Options (limit, etc.)
   */
  async getWalletNFTTrades(address, chain = "0x1", options = {}) {
    return this.request(`/wallets/${address}/nfts/trades`, {
      chain,
      ...options,
    });
  }

  /**
   * Obtenir les chaînes actives d'un wallet (multi-chain)
   * @param {string} address - Adresse du wallet
   */
  async getWalletActiveChains(address) {
    return this.request(`/wallets/${address}/chains`);
  }

  /**
   * Obtenir le PnL (Profit & Loss) d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletProfitability(address, chain = "0x1") {
    return this.request(`/wallets/${address}/profitability`, {
      chain,
    });
  }

  /**
   * Obtenir le résumé PnL d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletProfitabilitySummary(address, chain = "0x1") {
    return this.request(`/wallets/${address}/profitability/summary`, {
      chain,
    });
  }

  /**
   * Obtenir les approvals ERC20 d'un wallet
   * @param {string} address - Adresse du wallet
   * @param {string} chain - Chaîne blockchain
   */
  async getWalletApprovals(address, chain = "0x1") {
    return this.request(`/wallets/${address}/approvals`, {
      chain,
    });
  }

  /**
   * Résoudre un domaine ENS
   * @param {string} domain - Domaine ENS
   */
  async resolveENSDomain(domain) {
    return this.request(`/resolve/ens/${domain}`);
  }

  /**
   * Résoudre une adresse vers un domaine ENS
   * @param {string} address - Adresse Ethereum
   */
  async resolveAddressToDomain(address) {
    return this.request(`/resolve/${address}/reverse`);
  }
}

// Export singleton instance
const moralisClient = new MoralisClient();
export default moralisClient;

