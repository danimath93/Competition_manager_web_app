import { getCategoryType, getExperience, getNomiQuyenByCategoryType, getManyById } from '../services/configCacheService';
import { CompetitionTipologyLabels } from '../constants/enums/CompetitionEnums';
import { resolveAgeGroup } from './ageGroups';
import { getEligibleCategories, isExperienceBeltAllowed } from './competitionCategoryConfig';

// Funzione helper per calcolare l'età dell'atleta
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Funzione helper per valutare i vincoli di una categoria
const checkCategoryConstraints = (category, tipoCompetizioneId, athlete, selectedExperiences) => {
  if (!category.vincoli || category.vincoli.length === 0) {
    return true; // Nessun vincolo, categoria sempre disponibile
  }

  const athleteAge = calculateAge(athlete?.dataNascita);

  for (const vincolo of category.vincoli) {
    // Vincolo età (es. "eta:>17", "eta:<17", "eta:<=17")
    if (vincolo.startsWith('eta:')) {
      const condition = vincolo.substring(4); // Rimuove "eta:"
      const operator = condition.match(/[><=]+/)?.[0];
      const value = parseInt(condition.match(/\d+/)?.[0]);

      if (!athleteAge || !operator || isNaN(value)) {
        return false; // Dati mancanti, vincolo non soddisfatto
      }

      let satisfied = false;
      switch (operator) {
        case '>':
          satisfied = athleteAge > value;
          break;
        case '>=':
          satisfied = athleteAge >= value;
          break;
        case '<':
          satisfied = athleteAge < value;
          break;
        case '<=':
          satisfied = athleteAge <= value;
          break;
        case '=':
        case '==':
          satisfied = athleteAge === value;
          break;
        default:
          satisfied = false;
      }

      if (!satisfied) {
        return false;
      }
    }
    // Vincolo esperienza (es. "idEsperienza:6|7")
    else if (vincolo.startsWith('idEsperienza:')) {
      const allowedIds = vincolo.substring(13).split('|').map(id => parseInt(id.trim()));
      const selectedExp = selectedExperiences[tipoCompetizioneId];

      if (!selectedExp || !allowedIds.includes(selectedExp.id)) {
        return false; // Esperienza non selezionata o non valida
      }
    }
  }

  return true; // Tutti i vincoli soddisfatti
};

// Verifica i limiti di categorie della competizione (totale e per tipo competizione).
// Restituisce la lista dei messaggi di errore (vuota se i limiti sono rispettati)
const getCategoryLimitErrors = (competition, selectedCategoryIds, categoryDetails) => {
  const errors = [];

  if (competition?.maxCategorieAtleta && selectedCategoryIds.length > competition.maxCategorieAtleta) {
    errors.push(`Puoi selezionare al massimo ${competition.maxCategorieAtleta} categorie per questa competizione.`);
  }

  const limitsByType = competition?.maxCategorieTipoCompetizione || {};
  const countByType = {};
  selectedCategoryIds.forEach(categoryId => {
    const typeId = categoryDetails[categoryId]?.tipoCompetizioneId;
    if (typeId) {
      countByType[typeId] = (countByType[typeId] || 0) + 1;
    }
  });

  Object.entries(countByType).forEach(([typeId, count]) => {
    const max = limitsByType[typeId];
    if (max && count > max) {
      errors.push(`Puoi selezionare al massimo ${max} categorie di tipo ${CompetitionTipologyLabels[typeId] || typeId}.`);
    }
  });

  return errors;
};

/**
 * Restituisce la configurazione di iscrizione dell'atleta alla competizione:
 * categorie ammesse per fascia d'età e cintura, livelli di esperienza per tipo competizione.
 * Formato: { ageGroup, isBlackBelt, categorie: [{ configTipoCategoria }], esperienzaCategorie: [{ configTipoCompetizione, idEsperienza }] }
 * Con ageGroup null l'atleta non rientra in nessuna fascia d'età della competizione.
 */
const getAthleteRegistrationConfig = (competition, athlete, isBlackBelt) => {
  if (!competition || !athlete) return null;

  if (competition.categoryConfig) {
    const ageGroup = resolveAgeGroup(athlete.dataNascita, competition.ageGroupConfig, competition.dataInizio);
    if (!ageGroup) {
      return { ageGroup: null, isBlackBelt, categorie: [], esperienzaCategorie: [] };
    }
    return {
      ageGroup,
      isBlackBelt,
      categorie: getEligibleCategories(competition.categoryConfig, ageGroup, isBlackBelt)
        .map(category => ({ configTipoCategoria: category.categoryTypeId })),
      esperienzaCategorie: (competition.categoryConfig.experienceLevels || [])
        .filter(level => level.grouping === ageGroup.grouping)
        .map(level => ({ configTipoCompetizione: level.competitionTypeId, idEsperienza: level.experienceIds })),
    };
  }

  // Competizioni non ancora convertite: configurazione per tipo atleta
  const legacyConfig = competition.categorieAtleti?.find(ca => ca.idTipoAtleta === athlete.tipoAtletaId);
  return legacyConfig ? { ...legacyConfig, ageGroup: undefined } : null;
};

/**
 * Carica (tramite cache) tutti i dati di configurazione necessari all'iscrizione di un atleta:
 * - categoryDetails: tipoCategoriaId -> dettaglio tipo categoria
 * - experiencesByType: tipoCompetizioneId -> lista esperienze
 * - detailOptionsByCategory: tipoCategoriaId -> lista nomi quyen (solo se presente almeno un valore)
 */
const loadRegistrationConfig = async (athleteConfig) => {
  const categories = athleteConfig?.categorie || [];
  const experienceConfigs = athleteConfig?.esperienzaCategorie || [];
  const categoryIds = categories.map(category => category.configTipoCategoria);
  const experienceIds = experienceConfigs.flatMap(expConfig => expConfig.idEsperienza || []);

  const [categoryDetails, experiencesById, nomiQuyenByCategory] = await Promise.all([
    getManyById(categoryIds, getCategoryType),
    getManyById(experienceIds, getExperience),
    getManyById(categoryIds, getNomiQuyenByCategoryType),
  ]);

  const experiencesByType = {};
  // Livelli filtrati per cintura dell'atleta (se indicata nella configurazione)
  const filterByBelt = athleteConfig?.isBlackBelt !== undefined;
  experienceConfigs.forEach(expConfig => {
    experiencesByType[expConfig.configTipoCompetizione] = (expConfig.idEsperienza || [])
      .map(expId => experiencesById[expId])
      .filter(Boolean)
      .filter(exp => !filterByBelt || isExperienceBeltAllowed(exp.belt, athleteConfig.isBlackBelt));
  });

  const detailOptionsByCategory = {};
  Object.entries(nomiQuyenByCategory).forEach(([categoryId, nomiQuyen]) => {
    if (nomiQuyen?.length > 0) {
      detailOptionsByCategory[categoryId] = nomiQuyen;
    }
  });

  return { categoryDetails, experiencesByType, detailOptionsByCategory };
};

export { calculateAge, checkCategoryConstraints, getCategoryLimitErrors, getAthleteRegistrationConfig, loadRegistrationConfig };