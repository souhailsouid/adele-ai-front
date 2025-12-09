# 🔥 Guru Flow Tracker - Détection des Mouvements Institutionnels

## 📋 Vue d'ensemble

Le **Guru Flow Tracker** détecte les mouvements institutionnels (ventes, réductions de positions) **AVANT** la publication des 13F (qui ont 45 jours de retard).

## 🎯 Objectif

Comprendre comment les "gurus" (ARK, BlackRock, Berkshire, hedge funds) :
- Réduisent / vendent / shortent des positions
- Placent leurs ordres (VWAP, blocs, dark pools)
- Impactent le marché avec les vrais délais

## 🔍 Signaux Détectés

### 1. **Options Flow Analysis**
- **Put/Call Ratio** : Ratio élevé = possible hedging (vente)
- **Covered Calls** : Calls vendus = réduction d'exposition
- **Unusual Activity** : Activité inhabituelle = mouvement institutionnel

### 2. **Dark Pool Activity**
- **Volume Dark Pool** : Trades non visibles = ventes discrètes
- **Block Trades** : Trades de grande taille (>500k shares) = institutionnel
- **Pattern Detection** : VWAP vs Block vs Normal

### 3. **Volume Anomalies**
- **Volume Ratio** : Volume > 1.5x moyenne = anomalie
- **Price/Volume Divergence** : Volume élevé + prix qui baisse = vente
- **Pattern** : INSTITUTIONAL_SELLING détecté

### 4. **Price/Volume Patterns**
- **VWAP Selling** : Volume régulier + légère baisse = vente progressive
- **Aggressive Selling** : Volume élevé + forte baisse = vente agressive
- **Distribution** : Pattern de distribution institutionnelle

### 5. **SEC Filings Analysis**
- **13F Filings** : Confirmation (mais avec retard)
- **13D/13G** : Activisme ou positions > 5%
- **Timing** : Corrélation avec les signaux en temps réel

## 📊 Patterns Détectés

### **BLOCK_TRADE**
- Vente par blocs institutionnels
- Trades > 500k shares dans dark pools
- Impact : Fort mais discret

### **VWAP** (Volume-Weighted Average Price)
- Vente progressive sur la journée
- Volume régulier, prix qui baisse légèrement
- Impact : Faible mais constant

### **OPTIONS_HEDGE**
- Réduction d'exposition via options
- Covered calls, puts achetés
- Impact : Indirect mais significatif

### **AGGRESSIVE**
- Vente agressive détectée
- Volume élevé + forte baisse de prix
- Impact : Fort et visible

## 🧮 Calcul du Score

Le **Selling Score** est calculé avec pondération :
- Options Flow: 30%
- Dark Pool: 25%
- Volume Anomalies: 25%
- Price/Volume Patterns: 20%

**Score > 0.7** = Forte probabilité de vente institutionnelle  
**Score 0.4-0.7** = Signaux modérés  
**Score < 0.4** = Pas de signaux significatifs

## ⏱️ Délais Réels

| Événement | Quand | Qui le Voit |
|-----------|-------|-------------|
| Vente réelle | Jour J | Marché (difficile à détecter) |
| Exécution VWAP/Dark Pools | J → J+5 | Traders pro / Quants |
| Position finale (report_date) | Fin trimestre | Fonds seulement |
| Publication 13F (filing_date) | +45 jours | Tout le monde |
| Réaction du marché | Immédiat → Retard | Dépend du fonds & ticker |

**Le marché est pro-cyclique :**
- Les smart money sortent avant la chute
- Le retail découvre via 13F après la chute

## 🚀 Utilisation

### Analyse d'un Symbole
1. Entrer un symbole (ex: TSLA)
2. Cliquer sur "Analyser"
3. Voir les signaux détectés et le score

### Watchlist
1. Ajouter des symboles à la watchlist
2. Cliquer sur "Scanner Watchlist"
3. Voir tous les résultats triés par score

### Interprétation
- **HIGH Alert** : Forte probabilité de vente → Surveiller de près
- **MONITOR** : Signaux modérés → Maintenir la vigilance
- **LOW** : Pas de signaux → Normal

## 📈 Exemple Concret : ARK vend Tesla

**Scénario :**
1. ARK décide de réduire TSLA
2. Trader envoie ordre VWAP via Goldman Sachs
3. Exécution progressive dans dark pools
4. **Retail ne voit rien**
5. **Quants voient "léger selling pressure"**
6. Fin trimestre : Position réduite
7. **45 jours plus tard : 13F publié**
8. **Le monde apprend 2.5 mois après**

**Avec Guru Flow Tracker :**
- ✅ Détection des signaux dès J+1
- ✅ Pattern VWAP identifié
- ✅ Dark pool activity détectée
- ✅ Alert avant la publication 13F

## 🔧 Architecture Technique

### Service : `institutionalFlowDetector.js`
- Analyse multi-signaux
- Calcul de scores composites
- Détection de patterns
- Corrélation avec filings SEC

### API Route : `/api/aladdin/guru-flow`
- `GET ?symbol=AAPL` : Analyse d'un ticker
- `POST { tickers: [...] }` : Scan multiple

### Page : `/dashboards/trading/guru-flow-tracker`
- Interface de visualisation
- Watchlist management
- Détails des signaux
- Alertes visuelles

## ⚠️ Limitations

1. **Pas de données en temps réel** : Délai de quelques heures/jours
2. **Faux positifs possibles** : Pas tous les signaux = vente institutionnelle
3. **Confiance variable** : Score de confiance pour évaluer la fiabilité
4. **Rate limits** : Respect des limites API (Unusual Whales, FMP)

## 🎯 Prochaines Améliorations

1. **Machine Learning** : Améliorer la détection avec ML
2. **Backtesting** : Tester les performances historiques
3. **Alertes** : Notifications automatiques
4. **Corrélation Fonds** : Identifier quels fonds vendent
5. **Timeline** : Visualiser l'évolution des signaux dans le temps

## 📚 Références

- [INSTITUTIONAL_FILINGS_EXPLANATION.md](./INSTITUTIONAL_FILINGS_EXPLANATION.md) : Explication des filings SEC
- [ALADDIN_ARCHITECTURE.md](./ALADDIN_ARCHITECTURE.md) : Architecture générale Aladdin





