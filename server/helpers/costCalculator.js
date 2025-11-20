/**
 * Helper per calcolare i costi di iscrizione agli atleti
 * 
 * Struttura costiIscrizione:
 * {
 *   specials: {
 *     insurance: 5,
 *     otherFee: 10
 *   },
 *   categories: [
 *     {
 *       idConfigTipoAtleta: 1,
 *       type: "fixed" | "minimum" | "additional",
 *       config: {
 *         // Per "fixed":
 *         amount: 25
 *         
 *         // Per "minimum":
 *         minCategories: [1, 2, 5],
 *         costs: [20, 30, 50]
 *         
 *         // Per "additional":
 *         first: 20,
 *         extra: 10
 *       }
 *     }
 *   ]
 * }
 */

/**
 * Calcola il costo speciale (assicurazione, ecc.)
 * @param {Object} specials - Oggetto con i costi speciali
 * @returns {Number} - Totale costi speciali
 */
const calculateSpecialCosts = (athleteData, specials) => {
  if (!specials) return 0;

  let total = 0;
  // Devo gestire alcuni casi di costi speciali
  for (const [key, value] of Object.entries(specials)) {
    if (key === 'insurance' && typeof value === 'number') {
      if (!athleteData?.tesseramento) {
        total += parseFloat(value);
      }
    } 
    else if (typeof value === 'number') {
      total += parseFloat(value);
    }
  }

  return total;
};

/**
 * Calcola il costo per un tipo atleta con modalità "fixed"
 * @param {Object} config - Configurazione con { amount: 25 }
 * @param {Number} numCategories - Numero di categorie iscritte
 * @returns {Number} - Costo fisso
 */
const calculateFixedCost = (config, numCategories) => {
  if (!config || !config.amount || numCategories === 0) return 0;
  return parseFloat(config.amount) || 0;
};

/**
 * Calcola il costo per un tipo atleta con modalità "minimum"
 * Il costo cambia a scaglioni basati sul numero di categorie
 * @param {Object} config - Configurazione con { minCategories: [1,2,5], costs: [20,30,50] }
 * @param {Number} numCategories - Numero di categorie iscritte
 * @returns {Number} - Costo per lo scaglione corrispondente
 */
const calculateMinimumCost = (config, numCategories) => {
  if (!config || !config.minCategories || !config.costs || numCategories === 0) return 0;
  
  const { minCategories, costs } = config;
  
  // Trova lo scaglione appropriato
  let costIndex = 0;
  for (let i = 0; i < minCategories.length; i++) {
    if (numCategories >= minCategories[i]) {
      costIndex = i;
    } else {
      break;
    }
  }
  
  return parseFloat(costs[costIndex]) || 0;
};

/**
 * Calcola il costo per un tipo atleta con modalità "additional"
 * Costo fisso per la prima categoria + costo extra per ogni categoria aggiuntiva
 * @param {Object} config - Configurazione con { first: 20, extra: 10 }
 * @param {Number} numCategories - Numero di categorie iscritte
 * @returns {Number} - Costo totale (prima + extra)
 */
const calculateAdditionalCost = (config, numCategories) => {
  if (!config || !config.first || numCategories === 0) return 0;
  
  const firstCost = parseFloat(config.first) || 0;
  const extraCost = parseFloat(config.extra) || 0;
  
  if (numCategories === 1) {
    return firstCost;
  }
  
  return firstCost + (extraCost * (numCategories - 1));
};

/**
 * Calcola il costo totale per un atleta
 * @param {Object} costiIscrizione - Configurazione costi della competizione
 * @param {Number} idConfigTipoAtleta - ID del tipo atleta
 * @param {Number} numCategories - Numero di categorie in cui l'atleta è iscritto
 * @returns {Number} - Costo totale per l'atleta
 */
const calculateAthleteCost = (costiIscrizione, athleteData, categories) => {
  const numCategories = categories.length;
  if (!costiIscrizione || numCategories === 0) return 0;
  
  let totalCost = 0;
  const idConfigTipoAtleta = athleteData.tipoAtletaId;
  
  // Aggiungi costi speciali
  totalCost += calculateSpecialCosts(athleteData, costiIscrizione.specials);
  
  // Trova la configurazione per il tipo atleta
  if (costiIscrizione.categories && Array.isArray(costiIscrizione.categories)) {
    const categoryConfig = costiIscrizione.categories.find(
      cat => cat.idConfigTipoAtleta === idConfigTipoAtleta
    );

    // TODO: rimuovere questa impostazione o gestire in modo appropriato
    const idFestaDiNatale = 13;
    if (numCategories === 1 && categories[0] === idFestaDiNatale) {
      totalCost += 15;
      return parseFloat(totalCost.toFixed(2));
    }
    
    if (categoryConfig && categoryConfig.config) {
      switch (categoryConfig.type) {
        case 'fixed':
          totalCost += calculateFixedCost(categoryConfig.config, numCategories);
          break;
        case 'minimum':
          totalCost += calculateMinimumCost(categoryConfig.config, numCategories);
          break;
        case 'additional':
          totalCost += calculateAdditionalCost(categoryConfig.config, numCategories);
          break;
        default:
          console.warn(`Tipo di costo non riconosciuto: ${categoryConfig.type}`);
      }
    }
  }
  
  return parseFloat(totalCost.toFixed(2));
};

/**
 * Calcola i costi per tutti gli atleti iscritti di un club
 * @param {Array} iscrizioni - Array di iscrizioni atleti con atleta.tipoAtletaId
 * @param {Object} costiIscrizione - Configurazione costi della competizione
 * @returns {Object} - { totalCost, athletesCosts: [{ atletaId, cost, numCategories }] }
 */
const calculateClubTotalCost = (iscrizioni, costiIscrizione) => {
  if (!iscrizioni || iscrizioni.length === 0) {
    return { totalCost: 0, athletesCosts: [] };
  }
  
  // Raggruppa le iscrizioni per atleta
  const athletesMap = new Map();
  
  iscrizioni.forEach(iscrizione => {
    const atletaId = iscrizione.atletaId;
    if (!athletesMap.has(atletaId)) {
      athletesMap.set(atletaId, {
        atletaId,
        tipoAtletaId: iscrizione.atleta?.tipoAtletaId,
        tesseramento: iscrizione.atleta?.tesseramento,
        categories: []
      });
    }
    athletesMap.get(atletaId).categories.push(iscrizione.tipoCategoriaId);
  });
  
  // Calcola il costo per ogni atleta
  const athletesCosts = [];
  let totalCost = 0;
  
  athletesMap.forEach((athleteData) => {
    const cost = calculateAthleteCost(
      costiIscrizione,
      athleteData,
      athleteData.categories
    );
    
    athletesCosts.push({
      atletaId: athleteData.atletaId,
      cost,
      numCategories: athleteData.categories.length
    });
    
    totalCost += cost;
  });
  
  return {
    totalCost: parseFloat(totalCost.toFixed(2)),
    athletesCosts
  };
};

module.exports = {
  calculateSpecialCosts,
  calculateFixedCost,
  calculateMinimumCost,
  calculateAdditionalCost,
  calculateAthleteCost,
  calculateClubTotalCost
};
