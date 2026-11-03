// ID dei tipi competizione (config_tipo_competizioni). L'id 2 (Quyen con armi) è stato unificato in QUYEN.
export const CompetitionTipology = Object.freeze({
  QUYEN: 1,
  COMBATTIMENTO: 3,
  COMPLEMENTARI: 4
});

export const CompetitionTipologyLabels = Object.freeze({
  [CompetitionTipology.QUYEN]: 'Quyen',
  [CompetitionTipology.COMBATTIMENTO]: 'Combattimento',
  [CompetitionTipology.COMPLEMENTARI]: 'Attività complementari'
});

export const CompetitionLevel = Object.freeze({
  LOCAL: 'Locale',
  REGIONAL: 'Regionale',
  NATIONAL: 'Nazionale',
  INTERNATIONAL: 'Internazionale'
});

export const CompetitionStatus = Object.freeze({
  PLANNED: 'Pianificata',
  IN_PREPARATION: 'In preparazione',
  OPEN: 'Aperta',
  ONGOING: 'In corso',
  COMPLETED: 'Conclusa',
  CANCELLED: 'Annullata'
});

export const MembershipType = Object.freeze({
  FIWUK: 'FIWUK',
  ASI: 'ASI',
  REQUEST: 'Richiedi tesseramento' 
});