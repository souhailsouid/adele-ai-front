/**
 * Service pour le calendrier économique
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";

export class EconomicCalendarService {
  /**
   * Mots-clés pour identifier les événements très importants
   * Inclut les décisions de taux, inflation, GDP, emploi, etc.
   */
  static IMPORTANT_KEYWORDS = /(interest rate decision|policy rate|rate statement|fed|fomc|ecb|boj|boc|boe|rba|riksbank|snb|central bank|monetary policy|cpi|inflation|consumer price|gdp|gross domestic product|non-farm payrolls|unemployment rate|retail sales|employment|pmi|manufacturing|services|trade balance|current account)/i;

  /**
   * Pays majeurs à surveiller (US, Chine, Japon uniquement)
   */
  static MAJOR_COUNTRIES = ["US", "CN", "JP"];

  /**
   * Récupérer les événements économiques (format combiné FMP + UW)
   * @param {number} daysAhead - Nombre de jours à venir (défaut: 7) - utilisé si from/to non fournis
   * @param {string} impact - Filtrer par impact: "High", "Medium", "Low" (optionnel)
   * @param {string[]} countries - Filtrer par pays (optionnel)
   * @param {string} from - Date de début (YYYY-MM-DD) (optionnel, prioritaire sur daysAhead)
   * @param {string} to - Date de fin (YYYY-MM-DD) (optionnel, prioritaire sur daysAhead)
   * @returns {Promise<Array>} Tableau d'événements normalisés
   */
  async getEconomicEvents(daysAhead = 7, impact = null, countries = null, from = null, to = null) {
    try {
      let fromDate, toDate;
      
      // Utiliser from/to si fournis, sinon calculer avec daysAhead
      if (from && to) {
        fromDate = from;
        toDate = to;
      } else {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);
        fromDate = today.toISOString().split("T")[0];
        toDate = futureDate.toISOString().split("T")[0];
      }

      console.log(`[EconomicCalendarService] Fetching events from ${fromDate} to ${toDate}`);
      let response = await fmpUWClient.getFMPEconomicCalendar(fromDate, toDate);
      
      console.log(`[EconomicCalendarService] Raw response type:`, typeof response);
      console.log(`[EconomicCalendarService] Raw response:`, response);
      
      // Gérer la nouvelle structure de réponse combinée (FMP + UW)
      let events = [];
      if (Array.isArray(response)) {
        // Réponse directe en tableau (format FMP direct)
        console.log(`[EconomicCalendarService] Response is array with ${response.length} events`);
        events = response.map((event) => {
          // Normaliser les événements FMP directs
          return {
            date: event.date || '',
            event: event.event || 'N/A',
            country: event.country || 'N/A',
            impact: event.impact || 'N/A',
            time: event.date ? event.date.split(' ')[1] || null : null, // Extraire l'heure de la date
            currency: event.currency || null,
            previous: event.previous !== undefined && event.previous !== null ? Number(event.previous) : null,
            estimate: event.estimate !== undefined && event.estimate !== null ? Number(event.estimate) : null,
            actual: event.actual !== undefined && event.actual !== null ? Number(event.actual) : null,
            change: event.change !== undefined && event.change !== null ? Number(event.change) : null,
            changePercentage: event.changePercentage !== undefined && event.changePercentage !== null ? Number(event.changePercentage) : null,
            unit: event.unit || null,
            source: 'FMP',
          };
        });
      } else if (response && typeof response === 'object') {
        // Nouveau format combiné: { success: true, data: [...], count: 50, sources: {...} }
        if (response.success && response.data && Array.isArray(response.data)) {
          console.log(`[EconomicCalendarService] Response has data array with ${response.data.length} events`);
          // Normaliser les événements combinés
          events = response.data.map((event) => {
            // Priorité aux données combinées, sinon utiliser FMP, sinon UW
            const fmpData = event.fmp || {};
            const uwData = event.uw || {};
            
            return {
              // Champs principaux (priorité aux valeurs combinées)
              date: event.date || fmpData.date || uwData.date || '',
              event: event.event || fmpData.event || uwData.description || uwData.event || 'N/A',
              country: event.country || fmpData.country || uwData.country || 'N/A',
              impact: event.impact || fmpData.impact || uwData.impact || 'N/A',
              time: event.time || fmpData.time || uwData.time || null,
              currency: event.currency || fmpData.currency || null,
              
              // Valeurs numériques (priorité aux valeurs combinées)
              previous: event.previous !== undefined && event.previous !== null 
                ? Number(event.previous) 
                : (fmpData.previous !== undefined && fmpData.previous !== null ? Number(fmpData.previous) : null),
              estimate: event.estimate !== undefined && event.estimate !== null 
                ? Number(event.estimate) 
                : (fmpData.estimate !== undefined && fmpData.estimate !== null ? Number(fmpData.estimate) : null),
              actual: event.actual !== undefined && event.actual !== null 
                ? Number(event.actual) 
                : (fmpData.actual !== undefined && fmpData.actual !== null ? Number(fmpData.actual) : null),
              change: event.change !== undefined && event.change !== null 
                ? Number(event.change) 
                : (fmpData.change !== undefined && fmpData.change !== null ? Number(fmpData.change) : null),
              changePercentage: event.changePercentage !== undefined && event.changePercentage !== null 
                ? Number(event.changePercentage) 
                : (fmpData.changePercentage !== undefined && fmpData.changePercentage !== null ? Number(fmpData.changePercentage) : null),
              
              // Métadonnées
              source: event.source || 'FMP', // BOTH, FMP, ou UW
              unit: event.unit || fmpData.unit || null,
              
              // Données brutes pour référence
              _fmp: fmpData,
              _uw: uwData,
            };
          });
        } else if (response.data && Array.isArray(response.data)) {
          // Format avec data mais sans success
          events = response.data;
        } else if (response.events && Array.isArray(response.events)) {
          events = response.events;
        } else {
          console.warn("Unexpected response format from economic calendar API:", response);
          return [];
        }
      } else {
        console.warn("Invalid response from economic calendar API:", response);
        return [];
      }

      // S'assurer que tous les événements ont les champs requis
      events = events.filter((e) => {
        return e && typeof e === 'object' && (e.date || e.event);
      });

      console.log(`[EconomicCalendarService] Before filtering: ${events.length} events`);
      
      // Filtrer par impact si spécifié
      if (impact) {
        const beforeImpactFilter = events.length;
        events = events.filter((e) => e.impact === impact);
        console.log(`[EconomicCalendarService] After impact filter (${impact}): ${events.length} events (was ${beforeImpactFilter})`);
      }

      // Filtrer par pays si spécifié
      if (countries && countries.length > 0) {
        const beforeCountryFilter = events.length;
        events = events.filter((e) => e.country && countries.includes(e.country));
        console.log(`[EconomicCalendarService] After country filter (${countries.join(', ')}): ${events.length} events (was ${beforeCountryFilter})`);
      }
      
      console.log(`[EconomicCalendarService] Final events count: ${events.length}`);

      // Trier par date (plus proche en premier)
      events.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateA - dateB;
      });

      return events;
    } catch (error) {
      console.error("Error fetching economic calendar:", error);
      return [];
    }
  }

  /**
   * Récupérer uniquement les événements à haut impact
   */
  async getHighImpactEvents(daysAhead = 7) {
    return this.getEconomicEvents(daysAhead, "High");
  }

  /**
   * Récupérer les événements très importants
   * Seuls les événements High impact ET (correspondant aux mots-clés OU pays majeurs) sont inclus
   */
  async getVeryImportantEvents(daysAhead = 7) {
    const events = await this.getEconomicEvents(daysAhead);
    
    return events.filter((e) => {
      // Doit être High impact
      if (e.impact !== "High") return false;
      
      // ET soit correspondre aux mots-clés importants
      if (this.constructor.IMPORTANT_KEYWORDS.test(e.event)) return true;
      
      // OU être d'un pays majeur
      if (this.constructor.MAJOR_COUNTRIES.includes(e.country)) return true;
      
      return false;
    });
  }

  /**
   * Récupérer les événements des pays majeurs uniquement
   */
  async getMajorCountriesEvents(daysAhead = 7, impact = "High") {
    return this.getEconomicEvents(
      daysAhead,
      impact,
      this.constructor.MAJOR_COUNTRIES
    );
  }

  /**
   * Récupérer les décisions de taux d'intérêt uniquement
   * Inclut toutes les banques centrales majeures
   */
  async getInterestRateDecisions(daysAhead = 30) {
    const events = await this.getEconomicEvents(daysAhead);
    const rateKeywords = /(interest rate decision|policy rate|rate statement|fomc|ecb|boj|boc|boe|rba|riksbank|snb|central bank|monetary policy decision)/i;
    
    return events.filter((e) => rateKeywords.test(e.event));
  }

  /**
   * Récupérer les événements d'un pays spécifique
   * @param {string} country - Code pays (ex: "JP" pour Japon)
   * @param {number} daysAhead - Nombre de jours à venir
   * @param {string} impact - Filtrer par impact (optionnel)
   */
  async getCountryEvents(country, daysAhead = 30, impact = null) {
    return this.getEconomicEvents(daysAhead, impact, [country]);
  }

  /**
   * Obtenir le fuseau horaire d'un pays
   */
  getCountryTimezone(country) {
    const timezones = {
      US: "America/New_York", // EST/EDT
      CA: "America/Toronto",
      GB: "Europe/London", // GMT/BST
      EU: "Europe/Brussels", // CET/CEST
      DE: "Europe/Berlin", // CET/CEST
      FR: "Europe/Paris", // CET/CEST
      JP: "Asia/Tokyo", // JST (UTC+9)
      CN: "Asia/Shanghai", // CST (UTC+8)
      AU: "Australia/Sydney", // AEST/AEDT
    };
    return timezones[country] || "UTC";
  }

  /**
   * Obtenir l'offset d'un fuseau horaire par rapport à UTC (en millisecondes)
   */
  getTimezoneOffset(timezone, date) {
    // Créer deux dates identiques, une en UTC, une dans le fuseau horaire
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    // La différence donne l'offset
    return tzDate.getTime() - utcDate.getTime();
  }

  /**
   * Formater la date pour l'affichage avec conversion en fuseau horaire français
   * L'API FMP retourne les dates dans le fuseau horaire local du pays
   */
  formatEventDate(dateString, country = null) {
    if (!dateString) return "N/A";
    try {
      // L'API FMP retourne "YYYY-MM-DD HH:MM:SS" dans le fuseau horaire du pays
      if (!dateString.includes(" ")) {
        // Si pas d'heure, juste la date
        const date = new Date(dateString);
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const dayOfWeek = days[date.getDay()];
        return `${dayOfWeek} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      }
      
      const [datePart, timePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      
      // Obtenir le fuseau horaire du pays
      const countryTZ = country ? this.getCountryTimezone(country) : "UTC";
      
      // L'API FMP retourne l'heure dans le fuseau horaire local du pays
      // Exemple: "2025-12-19 09:30:00" pour un événement US = 09:30 EST/EDT
      // On doit convertir cette heure en heure française
      
      // Méthode simplifiée : créer une date en interprétant l'heure comme étant dans le fuseau du pays
      // Puis utiliser Intl pour convertir en heure française
      
      // Créer une date de référence (en UTC d'abord)
      const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      
      // Obtenir l'heure dans le fuseau du pays pour cette date UTC
      const countryFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: countryTZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      
      // Trouver le moment UTC qui correspond à l'heure donnée dans le fuseau du pays
      // On ajuste la date UTC jusqu'à ce que l'heure dans le fuseau du pays corresponde
      let adjustedUtc = utcDate;
      const countryParts = countryFormatter.formatToParts(adjustedUtc);
      let countryHour = parseInt(countryParts.find(p => p.type === "hour").value);
      let countryMinute = parseInt(countryParts.find(p => p.type === "minute").value);
      
      // Calculer l'ajustement nécessaire
      const hourDiff = hours - countryHour;
      const minuteDiff = minutes - countryMinute;
      const totalMinutesDiff = hourDiff * 60 + minuteDiff;
      
      // Ajuster la date UTC
      adjustedUtc = new Date(adjustedUtc.getTime() + totalMinutesDiff * 60 * 1000);
      
      // Maintenant convertir en heure française
      const dateInFrance = adjustedUtc;
      
      // Extraire les composants en heure française
      const formatterFR = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      
      const frParts = formatterFR.formatToParts(dateInFrance);
      const dayFR = parseInt(frParts.find(p => p.type === "day").value);
      const monthFR = parseInt(frParts.find(p => p.type === "month").value);
      const yearFR = parseInt(frParts.find(p => p.type === "year").value);
      const hoursFR = parseInt(frParts.find(p => p.type === "hour").value);
      const minutesFR = parseInt(frParts.find(p => p.type === "minute").value);
      
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      
      const countryTimeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      const hoursStr = String(hoursFR).padStart(2, "0");
      const minutesStr = String(minutesFR).padStart(2, "0");
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDateFR = new Date(yearFR, monthFR - 1, dayFR);
      eventDateFR.setHours(0, 0, 0, 0);
      
      // Obtenir le jour de la semaine
      const dayOfWeek = eventDateFR.getDay();
      const dayName = days[dayOfWeek];
      
      const diffTime = eventDateFR - today;
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Afficher l'heure du pays en premier, puis l'heure française si différente
      const timeDisplay = hoursStr !== countryTimeStr.substring(0, 2) || minutesStr !== countryTimeStr.substring(3, 5)
        ? `${countryTimeStr} (${country || "local"}) / ${hoursStr}:${minutesStr} (FR)`
        : `${countryTimeStr} (${country || "local"})`;
      
      if (daysUntil === 0) {
        return `${dayName} - Aujourd'hui ${timeDisplay}`;
      }
      if (daysUntil === 1) {
        return `${dayName} - Demain ${timeDisplay}`;
      }
      if (daysUntil > 1 && daysUntil <= 7) {
        return `${dayName} ${dayFR} ${months[monthFR - 1]} ${yearFR} ${timeDisplay}`;
      }
      
      return `${dayName} ${dayFR} ${months[monthFR - 1]} ${yearFR} ${timeDisplay}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString;
    }
  }

  /**
   * Obtenir la couleur selon l'impact
   */
  getImpactColor(impact) {
    if (!impact || typeof impact !== 'string') return "text";
    switch (impact) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "info";
      default:
        return "text";
    }
  }
}

const economicCalendarService = new EconomicCalendarService();
export default economicCalendarService;

