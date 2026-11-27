const { Competizione } = require('../models');
const { getAssociationMembershipTypes, getSelectableCompetitionMembershipTypes, getCompetitionMembershipTypes } = require('../helpers/membershipTypes');
const logger = require('../helpers/logger/logger');

const sendError = (res, error, message) => {
  logger.error(`${message}: ${error.message}`, { stack: error.stack });
  res.status(500).json({ error: message, details: error.message });
};

// GET /api/membership-types/association - Affiliazioni club (pubblica, usata dalla registrazione)
const getAssociationTypes = async (req, res) => {
  try {
    res.json(await getAssociationMembershipTypes());
  } catch (error) {
    sendError(res, error, 'Errore nel recupero dei tipi di affiliazione');
  }
};

// GET /api/membership-types/competition - Tipi selezionabili nella configurazione competizione
const getCompetitionTypes = async (req, res) => {
  try {
    res.json(await getSelectableCompetitionMembershipTypes());
  } catch (error) {
    sendError(res, error, 'Errore nel recupero dei tipi di tesseramento');
  }
};

// GET /api/competizioni/:competizioneId/membership-types - Tipi ammessi in iscrizione alla competizione
const getCompetitionRegistrationTypes = async (req, res) => {
  try {
    const competizione = await Competizione.findByPk(req.params.competizioneId, {
      attributes: ['id', 'membershipTypeIds', 'costiIscrizione'],
    });
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    res.json(await getCompetitionMembershipTypes(competizione));
  } catch (error) {
    sendError(res, error, 'Errore nel recupero dei tesseramenti della competizione');
  }
};

module.exports = {
  getAssociationTypes,
  getCompetitionTypes,
  getCompetitionRegistrationTypes,
};
