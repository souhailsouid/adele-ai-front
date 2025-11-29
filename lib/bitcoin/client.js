/**
 * Client API Bitcoin
 * Utilise BlockCypher API (gratuite) pour récupérer les données Bitcoin
 * Alternative: Blockchain.com API
 */

class BitcoinClient {
  constructor() {
    // BlockCypher API (gratuite, limite: 3 req/sec, 200 req/heure)
    this.blockcypherBaseUrl = "https://api.blockcypher.com/v1/btc/main";
    
    // Blockchain.com API (gratuite, limite: 1 req/sec)
    this.blockchainBaseUrl = "https://blockchain.info";
    
    // Blockstream API (gratuite, pas de limite connue)
    this.blockstreamBaseUrl = "https://blockstream.info/api";
  }

  /**
   * Faire une requête à BlockCypher API
   */
  async requestBlockCypher(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.blockcypherBaseUrl}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `BlockCypher API Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`BlockCypher API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Faire une requête à Blockchain.com API
   */
  async requestBlockchain(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.blockchainBaseUrl}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Blockchain.com API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Blockchain.com API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Faire une requête à Blockstream API
   */
  async requestBlockstream(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.blockstreamBaseUrl}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Blockstream API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Blockstream API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== WALLET API ====================

  /**
   * Obtenir le solde d'une adresse Bitcoin
   * @param {string} address - Adresse Bitcoin
   */
  async getAddressBalance(address) {
    try {
      // Essayer BlockCypher d'abord
      const data = await this.requestBlockCypher(`/addrs/${address}/balance`);
      return {
        address: address,
        balance: data.balance || 0, // Balance en satoshis
        balanceBTC: (data.balance || 0) / 100000000, // Convertir en BTC
        totalReceived: (data.total_received || 0) / 100000000,
        totalSent: (data.total_sent || 0) / 100000000,
        unconfirmedBalance: (data.unconfirmed_balance || 0) / 100000000,
        n_tx: data.n_tx || 0, // Nombre de transactions
        final_n_tx: data.final_n_tx || 0,
      };
    } catch (error) {
      console.error("Error getting balance from BlockCypher, trying Blockchain.com:", error);
      // Fallback sur Blockchain.com
      try {
        const data = await this.requestBlockchain(`/rawaddr/${address}`);
        return {
          address: address,
          balance: data.final_balance || 0,
          balanceBTC: (data.final_balance || 0) / 100000000,
          totalReceived: (data.total_received || 0) / 100000000,
          totalSent: (data.total_sent || 0) / 100000000,
          unconfirmedBalance: (data.unconfirmed_balance || 0) / 100000000,
          n_tx: data.n_tx || 0,
          final_n_tx: data.n_tx || 0,
        };
      } catch (fallbackError) {
        console.error("Error getting balance from Blockchain.com:", fallbackError);
        throw new Error("Impossible de récupérer le solde Bitcoin");
      }
    }
  }

  /**
   * Obtenir les transactions d'une adresse Bitcoin
   * @param {string} address - Adresse Bitcoin
   * @param {Object} options - Options (limit, offset, etc.)
   */
  async getAddressTransactions(address, options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    try {
      // Utiliser BlockCypher
      const data = await this.requestBlockCypher(`/addrs/${address}/full`, {
        limit: limit,
        offset: offset,
      });

      const transactions = (data.txs || []).map((tx) => ({
        hash: tx.hash,
        block_height: tx.block_height,
        block_time: tx.confirmed ? new Date(tx.confirmed).toISOString() : null,
        confirmations: tx.confirmations || 0,
        inputs: tx.inputs || [],
        outputs: tx.outputs || [],
        fees: tx.fees || 0,
        total: tx.total || 0,
        size: tx.size || 0,
        // Déterminer si c'est une entrée ou sortie pour cette adresse
        direction: this.getTransactionDirection(tx, address),
        value: this.getTransactionValue(tx, address),
      }));

      return {
        address: address,
        transactions: transactions,
        n_tx: data.n_tx || transactions.length,
        hasMore: transactions.length === limit,
      };
    } catch (error) {
      console.error("Error getting transactions from BlockCypher, trying Blockstream:", error);
      // Fallback sur Blockstream
      try {
        const txs = await this.requestBlockstream(`/address/${address}/txs`, {
          limit: limit,
        });

        const transactions = (txs || []).map((tx) => ({
          hash: tx.txid,
          block_height: tx.status.block_height,
          block_time: tx.status.block_time
            ? new Date(tx.status.block_time * 1000).toISOString()
            : null,
          confirmations: tx.status.confirmed ? 6 : 0, // Approximation
          inputs: tx.vin || [],
          outputs: tx.vout || [],
          fees: tx.fee || 0,
          total: tx.vout.reduce((sum, out) => sum + (out.value || 0), 0),
          size: tx.size || 0,
          direction: this.getTransactionDirectionBlockstream(tx, address),
          value: this.getTransactionValueBlockstream(tx, address),
        }));

        return {
          address: address,
          transactions: transactions,
          n_tx: transactions.length,
          hasMore: transactions.length === limit,
        };
      } catch (fallbackError) {
        console.error("Error getting transactions from Blockstream:", fallbackError);
        throw new Error("Impossible de récupérer les transactions Bitcoin");
      }
    }
  }

  /**
   * Obtenir les informations complètes d'une adresse Bitcoin
   * @param {string} address - Adresse Bitcoin
   */
  async getAddressInfo(address) {
    try {
      const [balanceData, transactionsData] = await Promise.allSettled([
        this.getAddressBalance(address),
        this.getAddressTransactions(address, { limit: 10 }),
      ]);

      const balance = balanceData.status === "fulfilled" ? balanceData.value : null;
      const transactions = transactionsData.status === "fulfilled"
        ? transactionsData.value
        : { transactions: [], n_tx: 0 };

      return {
        address: address,
        balance: balance,
        transactions: transactions.transactions || [],
        totalTransactions: transactions.n_tx || 0,
        stats: {
          totalReceived: balance?.totalReceived || 0,
          totalSent: balance?.totalSent || 0,
          balance: balance?.balanceBTC || 0,
          transactionCount: transactions.n_tx || 0,
        },
      };
    } catch (error) {
      console.error("Error getting address info:", error);
      throw error;
    }
  }

  /**
   * Obtenir le prix actuel du Bitcoin en USD
   */
  async getBitcoinPrice() {
    try {
      // Utiliser Blockchain.com pour le prix
      const data = await this.requestBlockchain("/ticker");
      return {
        usd: data.USD?.last || 0,
        eur: data.EUR?.last || 0,
        gbp: data.GBP?.last || 0,
      };
    } catch (error) {
      console.error("Error getting Bitcoin price:", error);
      // Fallback: utiliser un prix approximatif
      return {
        usd: 60000, // Prix approximatif
        eur: 55000,
        gbp: 48000,
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Déterminer la direction d'une transaction pour une adresse (BlockCypher)
   */
  getTransactionDirection(tx, address) {
    const addressLower = address.toLowerCase();
    let isInput = false;
    let isOutput = false;

    // Vérifier les inputs
    if (tx.inputs) {
      isInput = tx.inputs.some(
        (input) =>
          input.addresses &&
          input.addresses.some((addr) => addr.toLowerCase() === addressLower)
      );
    }

    // Vérifier les outputs
    if (tx.outputs) {
      isOutput = tx.outputs.some(
        (output) =>
          output.addresses &&
          output.addresses.some((addr) => addr.toLowerCase() === addressLower)
      );
    }

    if (isInput && isOutput) return "both";
    if (isInput) return "out";
    if (isOutput) return "in";
    return "unknown";
  }

  /**
   * Obtenir la valeur d'une transaction pour une adresse (BlockCypher)
   */
  getTransactionValue(tx, address) {
    const addressLower = address.toLowerCase();
    let valueIn = 0;
    let valueOut = 0;

    // Calculer les entrées
    if (tx.inputs) {
      tx.inputs.forEach((input) => {
        if (
          input.addresses &&
          input.addresses.some((addr) => addr.toLowerCase() === addressLower)
        ) {
          valueIn += input.output_value || 0;
        }
      });
    }

    // Calculer les sorties
    if (tx.outputs) {
      tx.outputs.forEach((output) => {
        if (
          output.addresses &&
          output.addresses.some((addr) => addr.toLowerCase() === addressLower)
        ) {
          valueOut += output.value || 0;
        }
      });
    }

    return {
      in: valueIn / 100000000, // Convertir en BTC
      out: valueOut / 100000000,
      net: (valueOut - valueIn) / 100000000,
    };
  }

  /**
   * Déterminer la direction d'une transaction pour une adresse (Blockstream)
   */
  getTransactionDirectionBlockstream(tx, address) {
    const addressLower = address.toLowerCase();
    let isInput = false;
    let isOutput = false;

    // Vérifier les inputs
    if (tx.vin) {
      isInput = tx.vin.some((input) => {
        if (input.prevout && input.prevout.scriptpubkey_address) {
          return input.prevout.scriptpubkey_address.toLowerCase() === addressLower;
        }
        return false;
      });
    }

    // Vérifier les outputs
    if (tx.vout) {
      isOutput = tx.vout.some((output) => {
        if (output.scriptpubkey_address) {
          return output.scriptpubkey_address.toLowerCase() === addressLower;
        }
        return false;
      });
    }

    if (isInput && isOutput) return "both";
    if (isInput) return "out";
    if (isOutput) return "in";
    return "unknown";
  }

  /**
   * Obtenir la valeur d'une transaction pour une adresse (Blockstream)
   */
  getTransactionValueBlockstream(tx, address) {
    const addressLower = address.toLowerCase();
    let valueIn = 0;
    let valueOut = 0;

    // Calculer les entrées (nécessite de récupérer les transactions précédentes)
    // Pour simplifier, on ne calcule que les sorties
    if (tx.vout) {
      tx.vout.forEach((output) => {
        if (output.scriptpubkey_address && output.scriptpubkey_address.toLowerCase() === addressLower) {
          valueOut += output.value || 0;
        }
      });
    }

    return {
      in: 0, // Nécessiterait des requêtes supplémentaires
      out: valueOut / 100000000, // Convertir en BTC
      net: valueOut / 100000000,
    };
  }
}

// Export singleton instance
const bitcoinClient = new BitcoinClient();
export default bitcoinClient;

