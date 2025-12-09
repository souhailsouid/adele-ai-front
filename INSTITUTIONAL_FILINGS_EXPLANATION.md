# 📋 Explication des Champs des Filings Institutionnels (13F)

## 🗓️ Dates

### `report_date` (Date du Rapport)
- **Qu'est-ce que c'est ?** La date de fin de la période couverte par le formulaire 13F
- **Exemple :** `"2025-09-30"` = 30 septembre 2025
- **Signification :** C'est le dernier jour de la période trimestrielle pour laquelle l'institution déclare ses positions
- **Fréquence :** Les institutions doivent déclarer leurs positions à la fin de chaque trimestre (31 mars, 30 juin, 30 septembre, 31 décembre)

### `filing_date` (Date de Dépôt)
- **Qu'est-ce que c'est ?** La date à laquelle le formulaire 13F a été déposé auprès de la SEC (Securities and Exchange Commission)
- **Exemple :** `"2025-11-26"` = 26 novembre 2025
- **Signification :** C'est la date réelle où l'institution a soumis son formulaire
- **Délai :** Les institutions ont 45 jours après la fin du trimestre pour déposer leur 13F
  - Pour Q3 (fin le 30/09) → dépôt avant le 15/11 environ

### Différence entre `report_date` et `filing_date`
```
report_date: 2025-09-30  ← Fin du trimestre (positions à cette date)
     ↓
     [45 jours pour préparer et déposer]
     ↓
filing_date: 2025-11-26  ← Date de dépôt du formulaire
```

**Pourquoi cette différence ?**
- Les institutions ont besoin de temps pour compiler leurs positions
- Le `report_date` montre l'état des positions à un moment précis
- Le `filing_date` montre quand cette information est devenue publique

## 💰 Prix

### `price_on_report` (Prix à la Date du Rapport)
- **Qu'est-ce que c'est ?** Le prix de clôture de l'action à la `report_date`
- **Exemple :** `"1.18"` = $1.18 le 30 septembre 2025
- **Signification :** C'est le prix utilisé pour valoriser les positions déclarées dans le 13F
- **Utilisation :** Permet de calculer la valeur totale des positions à la fin du trimestre

### `price_on_filing` (Prix à la Date de Dépôt)
- **Qu'est-ce que c'est ?** Le prix de clôture de l'action à la `filing_date`
- **Exemple :** `"1.18"` = $1.18 le 26 novembre 2025
- **Signification :** C'est le prix de l'action au moment où le formulaire est déposé
- **Utilisation :** Permet de voir si le prix a changé entre la fin du trimestre et la publication

### `avg_price` (Prix Moyen d'Achat)
- **Qu'est-ce que c'est ?** Le prix moyen auquel l'institution a acheté les actions
- **Exemple :** `"1.13"` = $1.13
- **Signification :** Si `avg_price < price_on_report`, l'institution est en profit
- **Calcul :** Moyenne pondérée de tous les achats

### `buy_price` / `sell_price`
- **buy_price :** Prix d'achat pour cette transaction spécifique
- **sell_price :** Prix de vente (null si c'est un achat)

### `close` (Prix de Clôture Actuel)
- **Qu'est-ce que c'est ?** Le prix de clôture le plus récent disponible
- **Exemple :** `"1.7"` = $1.70
- **Signification :** Prix actuel de l'action (peut être différent de `price_on_filing` si le filing est ancien)

## 📊 Exemple Concret

```json
{
  "ticker": "TXMD",
  "report_date": "2025-09-30",      // Positions au 30/09/2025
  "filing_date": "2025-11-26",      // Déposé le 26/11/2025
  "price_on_report": "1.18",         // Prix le 30/09 = $1.18
  "price_on_filing": "1.18",         // Prix le 26/11 = $1.18 (pas de changement)
  "avg_price": "1.13",               // Prix moyen d'achat = $1.13
  "close": "1.7",                    // Prix actuel = $1.70
  "units": 1,                        // 1 action achetée
  "units_change": 1                  // Changement : +1 action
}
```

### Analyse de cet exemple :

1. **Timeline :**
   - 30/09/2025 : Fin du trimestre, l'institution déclare ses positions
   - 26/11/2025 : Le formulaire est déposé (47 jours après, dans les délais)
   - Aujourd'hui : Prix actuel = $1.70

2. **Performance :**
   - Prix d'achat moyen : $1.13
   - Prix à la fin du trimestre : $1.18 → **+4.4% de profit**
   - Prix actuel : $1.70 → **+50.4% de profit depuis l'achat**

3. **Signification :**
   - L'institution a acheté à $1.13 en moyenne
   - À la fin du trimestre (30/09), le prix était à $1.18
   - Aujourd'hui, le prix est à $1.70, donc l'institution est en très bon profit

## 🎯 Pourquoi c'est Important ?

### Pour l'Analyse :
1. **Délai d'Information :** Les données sont vieilles de 45 jours minimum
2. **Prix de Référence :** `price_on_report` montre la valorisation au moment de la déclaration
3. **Performance :** Comparer `avg_price` avec `close` montre la performance actuelle
4. **Timing :** `filing_date` montre quand l'information est devenue publique

### Pour le Trading :
- Si `price_on_filing` < `close` → Le prix a monté depuis la publication
- Si `avg_price` < `close` → L'institution est en profit
- Si `units_change` > 0 → L'institution a augmenté sa position
- Si `units_change` < 0 → L'institution a réduit sa position

## ⚠️ Points d'Attention

1. **Délai de Publication :** Les données peuvent être vieilles de 45+ jours
2. **Prix Actuels :** `close` peut être très différent de `price_on_report`
3. **Période de Référence :** `report_date` est la date de référence, pas la date actuelle
4. **Valeur Totale :** Pour calculer la valeur totale, utiliser `price_on_report * shares_outstanding`





