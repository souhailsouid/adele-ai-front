# 📊 Guide BitInfoCharts - Extraction de Baleines

## 🎯 Source Excellente !

**BitInfoCharts** est une source très fiable pour trouver les adresses de baleines Bitcoin avec leurs labels vérifiés.

**URL :** https://bitinfocharts.com/bitcoin/rich-list

---

## 📋 Comment Extraire les Données

### Méthode 1 : Copier-Coller Manuel

1. Allez sur : https://bitinfocharts.com/bitcoin/rich-list
2. Sélectionnez le tableau (Top 100)
3. Copiez les colonnes : **Address**, **Label**, **Balance**
4. Utilisez le script `scripts/parse-bitinfocharts.js` pour formater

### Méthode 2 : Script Automatique

Le script `scripts/parse-bitinfocharts.js` contient déjà les données du Top 100.

**Pour l'utiliser :**
```bash
node scripts/parse-bitinfocharts.js
```

Cela générera le format prêt pour `config/cryptoWharts.js`.

---

## 🐋 Baleines Déjà Ajoutées (30+)

J'ai déjà ajouté les baleines les plus importantes du Top 100 :

### Exchanges (15+)
- ✅ Binance (6 wallets différents)
- ✅ Bitfinex (2 wallets)
- ✅ OKEx/OKX (3 wallets)
- ✅ Robinhood
- ✅ Coincheck
- ✅ Crypto.com
- ✅ Bitbank
- ✅ Ceffu
- ✅ BitMEX

### Gouvernements (3)
- ✅ UK Government Confiscated (2 wallets)
- ✅ Silk Road FBI Confiscated

### Hacks (2)
- ✅ MtGox Hack
- ✅ Bitfinex Hack Recovery (2 wallets)

### Autres (3)
- ✅ Tether Treasury
- ✅ Mr.100 (Trader connu)
- ✅ Binance Pool (Mining)

---

## 🔄 Pour Ajouter Plus de Baleines

### Depuis BitInfoCharts

1. **Allez sur la page Rich List**
   - Bitcoin : https://bitinfocharts.com/bitcoin/rich-list
   - Ethereum : https://bitinfocharts.com/ethereum/rich-list
   - Autres chaînes disponibles

2. **Identifiez les baleines importantes**
   - Cherchez les labels : `wallet: Exchange-Name`
   - Cherchez les labels gouvernementaux
   - Cherchez les hacks connus

3. **Utilisez le format :**
```javascript
{
  name: "Nom de la Baleine",
  type: "Exchange" | "Government" | "Hack" | "Mining" | "Stablecoin" | "Trader",
  chain: "BTC" | "ETH" | etc.,
  address: "adresse...",
  notes: "Source: BitInfoCharts Rich List - Rank #X - Balance",
},
```

---

## 📊 Types de Baleines Identifiables

### Par Label
- **Exchange** : `Binance`, `Coinbase`, `Kraken`, `Bitfinex`, `OKEx`, `OKX`, `Crypto.com`, `Bitbank`, `Coincheck`, `BitMEX`, `Robinhood`, `Ceffu`
- **Government** : `Gov`, `FBI`, `UK-Gov`, `Confiscated`, `Seizure`
- **Hack** : `Hack`, `MtGox`
- **Mining** : `Pool`
- **Stablecoin** : `Tether`, `USDC`
- **Trader** : `Mr.100`, etc.

---

## 🎯 Prochaines Étapes

### 1. Ethereum Rich List
Allez sur : https://bitinfocharts.com/ethereum/rich-list
- Même processus
- Plus d'exchanges et de DeFi protocols

### 2. Autres Chaînes
- Polygon : https://bitinfocharts.com/polygon/rich-list
- BSC : https://bitinfocharts.com/bnb/rich-list
- Arbitrum : https://bitinfocharts.com/arbitrum/rich-list

### 3. Mise à Jour Régulière
Les Rich Lists sont mises à jour régulièrement. Vérifiez périodiquement pour :
- Nouvelles adresses importantes
- Changements de balances
- Nouveaux labels

---

## ✅ Avantages de BitInfoCharts

1. ✅ **Labels vérifiés** : Les labels sont généralement corrects
2. ✅ **Mise à jour régulière** : Les données sont à jour
3. ✅ **Multi-chaînes** : Supporte Bitcoin, Ethereum, et autres
4. ✅ **Gratuit** : Accès libre aux Rich Lists
5. ✅ **Historique** : Peut voir l'historique des balances

---

## 🔧 Script d'Extraction

Le script `scripts/parse-bitinfocharts.js` peut être étendu pour :
- Parser automatiquement depuis l'URL
- Extraire plusieurs chaînes
- Générer le format directement dans `cryptoWhales.js`

---

## 📝 Notes

- Les adresses Bitcoin commencent par `1`, `3`, ou `bc1`
- Les balances sont en BTC
- Les labels peuvent changer (vérifiez régulièrement)
- Certaines adresses peuvent être des contrats (pour Ethereum)

---

## 🚀 Résultat

Avec BitInfoCharts, vous avez maintenant accès à :
- ✅ **30+ baleines Bitcoin** déjà ajoutées
- ✅ **Source fiable** pour en ajouter plus
- ✅ **Script d'extraction** pour automatiser
- ✅ **Multi-chaînes** supportées

**Temps estimé pour ajouter 50+ baleines :** 15-30 minutes avec BitInfoCharts !


