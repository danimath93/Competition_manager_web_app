export const CompetitionTipology = Object.freeze({
  MANI_NUDE: 1,
  ARMI: 2,
  COMBATTIMENTO: 3
});

// Mapping per la compatibilità con i vecchi valori stringa (se necessario)
export const CompetitionTipologyLabels = Object.freeze({
  [CompetitionTipology.MANI_NUDE]: 'Mani nude',
  [CompetitionTipology.ARMI]: 'Armi',
  [CompetitionTipology.COMBATTIMENTO]: 'Combattimento'
});

// Funzione helper per ottenere il label da un ID
export const getCompetitionTipologyLabel = (id) => {
  return CompetitionTipologyLabels[id] || 'Sconosciuto';
};

// Funzione helper per ottenere tutti i tipi come array
export const getAllCompetitionTipologies = () => {
  return Object.entries(CompetitionTipologyLabels).map(([id, label]) => ({
    id: parseInt(id),
    label
  }));
};

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
  COMPLETED: 'Completata',
  CANCELLED: 'Annullata'
});