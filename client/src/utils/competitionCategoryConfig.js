// Configurazione categorie della competizione (Competizione.categoryConfig)
// Struttura e validazione completa: server/helpers/competitionCategoryConfig.js

export const CATEGORY_CONFIG_VERSION = 1;

export const CATEGORY_BELT_OPTIONS = [
  { value: 'all', label: 'Tutte' },
  { value: 'blackBeltOnly', label: 'Solo CN' },
  { value: 'whiteBeltOnly', label: 'Solo CB' },
];

export const EXPERIENCE_BELT_LABELS = {
  all: 'Tutti',
  whiteBelt: 'Solo CB',
  blackBelt: 'Solo CN',
};

export const GROUPING_LABELS = {
  children: 'Bambini',
  adults: 'Adulti',
};

export const getCategoryBeltLabel = (belt) =>
  CATEGORY_BELT_OPTIONS.find(o => o.value === belt)?.label || belt;

export const emptyCategoryConfig = () => ({
  version: CATEGORY_CONFIG_VERSION,
  categories: [],
  experienceLevels: [],
});

// Raggruppamenti proposti di default per un tipo categoria, ricavati dai tipi atleta ammessi
// (1 = CB Bambini -> children, 2/3 = CB Adulti/CN -> adults)
export const getDefaultGroupings = (categoryType) => {
  const athleteTypes = categoryType?.idConfigTipiAtleti || [];
  if (athleteTypes.length === 0) return ['children', 'adults'];
  const groupings = [];
  if (athleteTypes.includes(1)) groupings.push('children');
  if (athleteTypes.includes(2) || athleteTypes.includes(3)) groupings.push('adults');
  return groupings;
};

// Chiavi delle fasce della configurazione età appartenenti ai raggruppamenti indicati
export const getGroupKeysByGroupings = (ageGroupConfig, groupings) =>
  (ageGroupConfig?.groups || []).filter(g => groupings.includes(g.grouping)).map(g => g.key);

// Rimuove dalla configurazione categorie le fasce non presenti nella configurazione età
// (es. dopo il cambio della configurazione fasce); le categorie senza fasce vengono rimosse
export const pruneCategoryConfig = (categoryConfig, ageGroupConfig) => {
  if (!categoryConfig) return emptyCategoryConfig();
  const keys = new Set((ageGroupConfig?.groups || []).map(g => g.key));
  return {
    ...categoryConfig,
    categories: (categoryConfig.categories || [])
      .map(c => ({ ...c, ageGroupKeys: c.ageGroupKeys.filter(k => keys.has(k)) }))
      .filter(c => c.ageGroupKeys.length > 0),
  };
};

// Raggruppamenti effettivamente usati per ogni tipo competizione, dato l'elenco dei tipi categoria
export const getUsedGroupingsByCompetitionType = (categoryConfig, ageGroupConfig, categoryTypes) => {
  const groupingByKey = new Map((ageGroupConfig?.groups || []).map(g => [g.key, g.grouping]));
  const result = {};
  (categoryConfig?.categories || []).forEach(category => {
    const categoryType = categoryTypes.find(ct => ct.id === category.categoryTypeId);
    if (!categoryType) return;
    const typeId = categoryType.tipoCompetizioneId;
    if (!result[typeId]) result[typeId] = new Set();
    category.ageGroupKeys.forEach(key => {
      const grouping = groupingByKey.get(key);
      if (grouping) result[typeId].add(grouping);
    });
  });
  return result;
};

// Verifica se la cintura dell'atleta è ammessa dalla categoria
export const isBeltAllowed = (belt, isBlackBelt) => {
  if (belt === 'blackBeltOnly') return !!isBlackBelt;
  if (belt === 'whiteBeltOnly') return !isBlackBelt;
  return true;
};

// Verifica se il livello di esperienza è compatibile con la cintura dell'atleta (ConfigEsperienza.belt)
export const isExperienceBeltAllowed = (experienceBelt, isBlackBelt) => {
  if (experienceBelt === 'blackBelt') return !!isBlackBelt;
  if (experienceBelt === 'whiteBelt') return !isBlackBelt;
  return true;
};

// Categorie della configurazione a cui l'atleta può iscriversi (fascia d'età e cintura)
export const getEligibleCategories = (categoryConfig, ageGroup, isBlackBelt) => {
  if (!categoryConfig || !Array.isArray(categoryConfig.categories) || !ageGroup) return [];
  return categoryConfig.categories.filter(category =>
    category.ageGroupKeys.includes(ageGroup.key) && isBeltAllowed(category.belt, isBlackBelt)
  );
};
