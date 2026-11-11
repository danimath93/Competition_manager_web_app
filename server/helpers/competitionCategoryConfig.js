/**
 * Configurazione categorie di una competizione (Competizione.categoryConfig)
 *
 * Struttura JSON (version 1):
 * {
 *   version: 1,
 *   categories: [
 *     { categoryTypeId: 1, ageGroupKeys: ['pulcini', 'bambini'], belt: 'all' }   // belt: all | blackBeltOnly | whiteBeltOnly
 *   ],
 *   experienceLevels: [
 *     { competitionTypeId: 1, grouping: 'children', experienceIds: [3, 4, 5] }  // grouping: children | adults
 *   ]
 * }
 *
 * - ageGroupKeys fa riferimento a groups[].key della configurazione fasce età salvata in competizione
 * - i livelli di esperienza sono definiti per tipo competizione e raggruppamento; all'iscrizione
 *   vengono filtrati in base alla cintura dell'atleta (ConfigEsperienza.belt)
 */

const { AGE_GROUPINGS } = require('./ageGroups');

const CATEGORY_CONFIG_VERSION = 1;
const CATEGORY_BELTS = ['all', 'blackBeltOnly', 'whiteBeltOnly'];

const CONFIG_KEYS = ['version', 'categories', 'experienceLevels'];
const CATEGORY_KEYS = ['categoryTypeId', 'ageGroupKeys', 'belt'];
const EXPERIENCE_KEYS = ['competitionTypeId', 'grouping', 'experienceIds'];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

/**
 * Verifica se la cintura dell'atleta è ammessa dalla categoria
 */
const isBeltAllowed = (belt, isBlackBelt) => {
  if (belt === 'blackBeltOnly') return !!isBlackBelt;
  if (belt === 'whiteBeltOnly') return !isBlackBelt;
  return true;
};

/**
 * Verifica se il livello di esperienza è compatibile con la cintura dell'atleta (ConfigEsperienza.belt)
 */
const isExperienceBeltAllowed = (experienceBelt, isBlackBelt) => {
  if (experienceBelt === 'blackBelt') return !!isBlackBelt;
  if (experienceBelt === 'whiteBelt') return !isBlackBelt;
  return true;
};

/**
 * Valida e normalizza la configurazione categorie rispetto alla configurazione fasce età della competizione
 * @param {Object} categoryConfig - configurazione categorie
 * @param {Object} ageGroupConfig - configurazione fasce età salvata in competizione
 * @returns {{ valid: boolean, errors: string[], config: Object|null }}
 */
const validateCategoryConfig = (categoryConfig, ageGroupConfig) => {
  const errors = [];

  if (!isPlainObject(categoryConfig)) {
    return { valid: false, errors: ['La configurazione categorie deve essere un oggetto'], config: null };
  }
  if (!ageGroupConfig || !Array.isArray(ageGroupConfig.groups)) {
    return { valid: false, errors: ['Seleziona la configurazione delle fasce d\'età prima delle categorie'], config: null };
  }

  const unknownKeys = Object.keys(categoryConfig).filter(k => !CONFIG_KEYS.includes(k));
  if (unknownKeys.length > 0) {
    errors.push(`Proprietà non ammesse nella configurazione categorie: ${unknownKeys.join(', ')}`);
  }
  if (categoryConfig.version !== CATEGORY_CONFIG_VERSION) {
    errors.push(`Versione configurazione categorie non supportata (attesa ${CATEGORY_CONFIG_VERSION})`);
  }

  const groupKeys = new Set(ageGroupConfig.groups.map(g => g.key));

  // Categorie
  if (!Array.isArray(categoryConfig.categories) || categoryConfig.categories.length === 0) {
    errors.push('Seleziona almeno una categoria');
  } else {
    const seen = new Set();
    categoryConfig.categories.forEach((category, index) => {
      const position = `Categoria ${index + 1}`;
      if (!isPlainObject(category)) {
        errors.push(`${position}: deve essere un oggetto`);
        return;
      }
      const unknown = Object.keys(category).filter(k => !CATEGORY_KEYS.includes(k));
      if (unknown.length > 0) {
        errors.push(`${position}: proprietà non ammesse ${unknown.join(', ')}`);
      }
      if (!isPositiveInteger(category.categoryTypeId)) {
        errors.push(`${position}: tipo categoria non valido`);
      } else if (seen.has(category.categoryTypeId)) {
        errors.push(`${position}: tipo categoria ${category.categoryTypeId} duplicato`);
      } else {
        seen.add(category.categoryTypeId);
      }
      if (!Array.isArray(category.ageGroupKeys) || category.ageGroupKeys.length === 0) {
        errors.push(`${position}: seleziona almeno una fascia d'età`);
      } else {
        const missing = category.ageGroupKeys.filter(key => !groupKeys.has(key));
        if (missing.length > 0) {
          errors.push(`${position}: fasce d'età non presenti nella configurazione (${missing.join(', ')})`);
        }
      }
      if (!CATEGORY_BELTS.includes(category.belt)) {
        errors.push(`${position}: cintura non valida (valori ammessi ${CATEGORY_BELTS.join(', ')})`);
      }
    });
  }

  // Livelli di esperienza
  const experienceLevels = categoryConfig.experienceLevels === undefined ? [] : categoryConfig.experienceLevels;
  if (!Array.isArray(experienceLevels)) {
    errors.push('I livelli di esperienza devono essere una lista');
  } else {
    const seen = new Set();
    experienceLevels.forEach((level, index) => {
      const position = `Livelli esperienza ${index + 1}`;
      if (!isPlainObject(level)) {
        errors.push(`${position}: deve essere un oggetto`);
        return;
      }
      const unknown = Object.keys(level).filter(k => !EXPERIENCE_KEYS.includes(k));
      if (unknown.length > 0) {
        errors.push(`${position}: proprietà non ammesse ${unknown.join(', ')}`);
      }
      if (!isPositiveInteger(level.competitionTypeId)) {
        errors.push(`${position}: tipo competizione non valido`);
      }
      if (!AGE_GROUPINGS.includes(level.grouping)) {
        errors.push(`${position}: raggruppamento non valido`);
      }
      const key = `${level.competitionTypeId}_${level.grouping}`;
      if (seen.has(key)) {
        errors.push(`${position}: livelli duplicati per tipo competizione e raggruppamento`);
      }
      seen.add(key);
      if (!Array.isArray(level.experienceIds) || !level.experienceIds.every(isPositiveInteger)) {
        errors.push(`${position}: livelli di esperienza non validi`);
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors, config: null };
  }

  // Normalizzazione: fasce ordinate come nella configurazione età, livelli senza duplicati
  const groupOrder = new Map(ageGroupConfig.groups.map((g, i) => [g.key, i]));
  const normalized = {
    version: CATEGORY_CONFIG_VERSION,
    categories: categoryConfig.categories.map(category => ({
      categoryTypeId: category.categoryTypeId,
      ageGroupKeys: [...new Set(category.ageGroupKeys)].sort((a, b) => groupOrder.get(a) - groupOrder.get(b)),
      belt: category.belt
    })),
    experienceLevels: experienceLevels
      .map(level => ({
        competitionTypeId: level.competitionTypeId,
        grouping: level.grouping,
        experienceIds: [...new Set(level.experienceIds)]
      }))
      .filter(level => level.experienceIds.length > 0)
  };

  return { valid: true, errors: [], config: normalized };
};

/**
 * Restituisce le categorie della configurazione a cui l'atleta può iscriversi
 * @param {Object} categoryConfig - configurazione categorie della competizione
 * @param {Object|null} ageGroup - fascia età dell'atleta (da resolveAgeGroup)
 * @param {boolean} isBlackBelt - grado CN dell'atleta
 */
const getEligibleCategories = (categoryConfig, ageGroup, isBlackBelt) => {
  if (!categoryConfig || !Array.isArray(categoryConfig.categories) || !ageGroup) return [];
  return categoryConfig.categories.filter(category =>
    category.ageGroupKeys.includes(ageGroup.key) && isBeltAllowed(category.belt, isBlackBelt)
  );
};

/**
 * Restituisce gli ID dei livelli di esperienza configurati per tipo competizione e raggruppamento
 */
const getExperienceIds = (categoryConfig, competitionTypeId, grouping) => {
  const level = (categoryConfig?.experienceLevels || []).find(l =>
    l.competitionTypeId === competitionTypeId && l.grouping === grouping
  );
  return level ? level.experienceIds : [];
};

/**
 * ID dei tipi categoria previsti dalla competizione
 */
const getCompetitionCategoryTypeIds = (competizione) =>
  (competizione?.categoryConfig?.categories || []).map(c => c.categoryTypeId);

module.exports = {
  CATEGORY_CONFIG_VERSION,
  CATEGORY_BELTS,
  isBeltAllowed,
  isExperienceBeltAllowed,
  validateCategoryConfig,
  getEligibleCategories,
  getExperienceIds,
  getCompetitionCategoryTypeIds
};
