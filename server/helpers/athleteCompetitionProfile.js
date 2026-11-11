/**
 * Profilo dell'atleta in una competizione: grado CN registrato all'iscrizione e fascia d'età
 * calcolata con la configurazione salvata in competizione alla data di inizio gara.
 * Usato da export, riepiloghi e classifiche al posto del vecchio tipo atleta.
 */

const { DettaglioIscrizioneAtleta } = require('../models');
const { resolveAgeGroup } = require('./ageGroups');

const GROUPING_LABELS = {
  children: 'Bambini',
  adults: 'Adulti'
};

/**
 * Mappa atletaId -> grado CN registrato al momento dell'iscrizione alla competizione
 */
const loadRegistrationBlackBelts = async (competizioneId) => {
  const details = await DettaglioIscrizioneAtleta.findAll({
    where: { competizioneId },
    attributes: ['atletaId', 'isBlackBelt']
  });
  return new Map(details.map(d => [d.atletaId, d.isBlackBelt]));
};

/**
 * @param {Object} athlete - atleta con dataNascita e isBlackBelt
 * @param {Object} competition - competizione con ageGroupConfig e dataInizio
 * @param {boolean|null} registrationBlackBelt - grado CN registrato all'iscrizione (se assente si usa quello dell'atleta)
 */
const getAthleteCompetitionProfile = (athlete, competition, registrationBlackBelt) => {
  const isBlackBelt = registrationBlackBelt ?? !!athlete?.isBlackBelt;
  const belt = isBlackBelt ? 'CN' : 'CB';
  const ageGroup = resolveAgeGroup(athlete?.dataNascita, competition?.ageGroupConfig, competition?.dataInizio);
  const groupingLabel = ageGroup ? GROUPING_LABELS[ageGroup.grouping] : 'Fuori fascia';

  return {
    isBlackBelt,
    belt,
    ageGroup,
    ageGroupLabel: ageGroup ? ageGroup.label : 'Non definita',
    grouping: ageGroup ? ageGroup.grouping : null,
    groupingLabel,
    profileLabel: `${groupingLabel} ${belt}`
  };
};

/**
 * Etichette delle fasce d'età di una categoria (ageGroupKeys) secondo la configurazione della competizione
 */
const getAgeGroupLabels = (ageGroupKeys, competition) => {
  const groups = competition?.ageGroupConfig?.groups || [];
  return (ageGroupKeys || []).map(key => groups.find(g => g.key === key)?.label || key);
};

module.exports = {
  GROUPING_LABELS,
  loadRegistrationBlackBelts,
  getAthleteCompetitionProfile,
  getAgeGroupLabels
};
