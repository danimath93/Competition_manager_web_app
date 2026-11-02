/**
 * Helper per calcolare i costi di iscrizione agli atleti
 * 
 * Struttura costiIscrizione:
 * {
 *   tesseramento: {
 *     enabled: true,
 *     amount: 5               // applicato agli atleti con "Richiedi tesseramento"
 *   },
 *   specialCategories: [
 *     {
 *       idConfigTipoCategoria: 13,
 *       singleCost: 15,       // costo se è l'unica categoria dell'atleta (obbligatorio)
 *       withOthersCost: 5     // costo se iscritto anche ad altre categorie (facoltativo:
 *                             // se null la categoria rientra nel calcolo standard)
 *     }
 *   ],
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

const REQUEST_MEMBERSHIP = 'RICHIEDI TESSERAMENTO';

const isMembershipRequested = (athleteData) =>
  athleteData?.tesseramento?.toUpperCase() === REQUEST_MEMBERSHIP;

/**
 * Calcola il costo del tesseramento richiesto in fase di iscrizione
 * @param {Object} athleteData - Dati atleta con il tesseramento scelto
 * @param {Object} tesseramento - Configurazione { enabled, amount }
 * @returns {Number} - Costo tesseramento
 */
const calculateMembershipCost = (athleteData, tesseramento) => {
  if (!tesseramento?.enabled || !isMembershipRequested(athleteData)) return 0;
  return parseFloat(tesseramento.amount) || 0;
};

/**
 * Separa le categorie speciali da quelle standard e ne calcola il costo
 * - categoria speciale unica iscritta dall'atleta -> singleCost
 * - categoria speciale insieme ad altre -> withOthersCost, se configurato;
 *   altrimenti la categoria viene conteggiata come standard
 * @param {Array} specialCategories - Configurazioni categorie speciali
 * @param {Array} categories - ID tipo categoria a cui l'atleta è iscritto
 * @returns {{ cost: Number, standardCategories: Array }}
 */
const calculateSpecialCategoriesCost = (specialCategories, categories) => {
  if (!Array.isArray(specialCategories) || specialCategories.length === 0) {
    return { cost: 0, standardCategories: categories };
  }

  let cost = 0;
  const standardCategories = [];
  const hasOtherCategories = categories.length > 1;

  for (const categoryId of categories) {
    const specialConfig = specialCategories.find(sc => sc.idConfigTipoCategoria === categoryId);

    if (!specialConfig) {
      standardCategories.push(categoryId);
    } else if (!hasOtherCategories) {
      cost += parseFloat(specialConfig.singleCost) || 0;
    } else if (specialConfig.withOthersCost !== null && specialConfig.withOthersCost !== undefined) {
      cost += parseFloat(specialConfig.withOthersCost) || 0;
    } else {
      standardCategories.push(categoryId);
    }
  }

  return { cost, standardCategories };
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
 * @param {Object} athleteData - Dati atleta ({ tipoAtletaId, tesseramento })
 * @param {Array} categories - ID tipo categoria a cui l'atleta è iscritto
 * @returns {Number} - Costo totale per l'atleta
 */
const calculateAthleteCost = (costiIscrizione, athleteData, categories) => {
  if (!costiIscrizione || categories.length === 0) return 0;

  let totalCost = 0;
  const idConfigTipoAtleta = athleteData.tipoAtletaId;

  // Tesseramento richiesto in fase di iscrizione
  totalCost += calculateMembershipCost(athleteData, costiIscrizione.tesseramento);

  // Categorie speciali: hanno un costo dedicato e vengono escluse dal calcolo standard
  const { cost: specialCategoriesCost, standardCategories } = calculateSpecialCategoriesCost(
    costiIscrizione.specialCategories,
    categories
  );
  totalCost += specialCategoriesCost;
  const numCategories = standardCategories.length;

  // Trova la configurazione per il tipo atleta
  if (numCategories > 0 && Array.isArray(costiIscrizione.categories)) {
    const categoryConfig = costiIscrizione.categories.find(
      cat => cat.idConfigTipoAtleta === idConfigTipoAtleta
    );

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

module.exports = {
  calculateMembershipCost,
  calculateSpecialCategoriesCost,
  calculateFixedCost,
  calculateMinimumCost,
  calculateAdditionalCost,
  calculateAthleteCost,
};
