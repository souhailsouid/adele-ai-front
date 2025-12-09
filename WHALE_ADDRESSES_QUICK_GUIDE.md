# 🐋 Guide Rapide - Trouver des Adresses de Baleines

## ⚡ Méthode la Plus Rapide

### 1. **Arkham Intelligence** (5 minutes)

1. Allez sur : https://intel.arkm.com/explorer
2. Tapez dans la recherche :
   - `US Government` → Voir toutes les saisies gouvernementales
   - `Binance` → Voir tous les wallets Binance
   - `Coinbase` → Voir tous les wallets Coinbase
   - `MicroStrategy` → Voir les wallets institutionnels
   - `Donald Trump` → Voir les wallets de personnalités
3. Cliquez sur l'entité
4. Copiez les adresses affichées

**Exemple direct :**
- https://intel.arkm.com/explorer/entity/us-government
- https://intel.arkm.com/explorer/entity/binance
- https://intel.arkm.com/explorer/entity/donald-trump

---

## 📋 Liste de Recherches Prêtes à l'Emploi

### Gouvernements
```
https://intel.arkm.com/explorer/entity/us-government
https://intel.arkm.com/explorer/entity/uk-government
```

### Exchanges Majeurs
```
https://intel.arkm.com/explorer/entity/binance
https://intel.arkm.com/explorer/entity/coinbase
https://intel.arkm.com/explorer/entity/kraken
https://intel.arkm.com/explorer/entity/bitfinex
https://intel.arkm.com/explorer/entity/okx
https://intel.arkm.com/explorer/entity/bybit
```

### Institutions
```
https://intel.arkm.com/explorer/entity/microstrategy
https://intel.arkm.com/explorer/entity/grayscale
https://intel.arkm.com/explorer/entity/tesla
```

### Fondateurs & Personnalités
```
https://intel.arkm.com/explorer/entity/vitalik-buterin
https://intel.arkm.com/explorer/entity/donald-trump
https://intel.arkm.com/explorer/entity/elon-musk
```

### Treasuries (Stablecoins)
```
https://intel.arkm.com/explorer/entity/tether
https://intel.arkm.com/explorer/entity/usdc
```

---

## 🔧 Méthode Alternative : Etherscan Labels

1. Allez sur : https://etherscan.io/labelcloud
2. Filtrez par catégorie :
   - **Exchange** → Tous les exchanges
   - **Mining Pool** → Pools de minage
3. Cliquez sur un label
4. Copiez l'adresse

---

## 📝 Format à Copier

Quand vous trouvez une adresse, utilisez ce format :

```javascript
{
  name: "Nom de la Baleine",
  type: "Government" | "Exchange" | "Institution" | "Founder" | "Foundation" | "DAO",
  chain: "ETH" | "BTC" | "POLYGON" | "BSC" | "ARBITRUM" | "OPTIMISM",
  address: "0x... ou bc1... ou 1...",
  notes: "Source: Arkham Intel",
}
```

---

## 🎯 Top 20 Baleines à Ajouter en Priorité

1. **US Government** (plusieurs adresses de saisies)
2. **Binance** (hot/cold wallets)
3. **Coinbase** (custody wallets)
4. **Tether Treasury**
5. **USDC Treasury**
6. **MicroStrategy**
7. **Grayscale Bitcoin Trust**
8. **Vitalik Buterin**
9. **Kraken**
10. **Bitfinex**
11. **OKX**
12. **Bybit**
13. **Huobi**
14. **Gemini**
15. **Crypto.com**
16. **FTX** (si applicable)
17. **Alameda Research**
18. **Three Arrows Capital** (si applicable)
19. **Celsius** (si applicable)
20. **BlockFi** (si applicable)

---

## ⚡ Script Automatique

Un script est disponible dans `scripts/fetch-whale-addresses.js` pour extraire automatiquement les adresses depuis Arkham.

**Utilisation :**
1. Ouvrez une page Arkham dans votre navigateur
2. Ouvrez la console (F12)
3. Copiez-collez le contenu de `scripts/fetch-whale-addresses.js`
4. Exécutez `fetchWhaleAddresses()`
5. Copiez le format généré

---

## 💡 Astuce Pro

Créez un dossier de bookmarks avec ces liens Arkham pour accès rapide :

```
📁 Baleines Crypto
  ├── 🏛️ Gouvernements
  │   ├── US Government
  │   └── UK Government
  ├── 💱 Exchanges
  │   ├── Binance
  │   ├── Coinbase
  │   └── Kraken
  ├── 🏢 Institutions
  │   ├── MicroStrategy
  │   └── Grayscale
  └── 👤 Personnalités
      ├── Vitalik Buterin
      └── Donald Trump
```

---

## ✅ Checklist Avant d'Ajouter

- [ ] Adresse vérifiée sur Etherscan/Polygonscan
- [ ] Type correct (Government, Exchange, etc.)
- [ ] Chaîne correcte (ETH, BTC, etc.)
- [ ] Note avec source (Arkham, Etherscan, etc.)
- [ ] Nom descriptif et clair

---

## 🚀 Prochaines Étapes

1. Commencez par les **Gouvernements** (impact le plus fort)
2. Ajoutez les **Exchanges majeurs** (Binance, Coinbase)
3. Ajoutez les **Institutions** (MicroStrategy, Grayscale)
4. Ajoutez les **Personnalités** (Vitalik, Trump, etc.)

**Temps estimé :** 30-60 minutes pour ajouter 20-30 baleines importantes





