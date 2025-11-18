const {Atleta, Club, ConfigTipoAtleta } = require('../models');
const logger = require('../helpers/logger/logger');

// Ottieni tutti gli atleti
const getAllAtleti = async (req, res) => {
  try {
    const atleti = await Atleta.findAll({
      include: [
        {
          model: Club,
          as: 'club',
          attributes: { exclude: ['logo'] }
        },
        {
          model: ConfigTipoAtleta,
          as: 'tipoAtleta'
        }
      ],
      order: [['cognome', 'ASC']]
      // ordinati anche per club
    });
    res.status(200).json(atleti);
  } catch (error) {
    logger.error(`Errore nel recupero degli atleti: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero degli atleti',
      details: error.message 
    });
  }
};

// Ottieni tutti gli atleti di un club specifico
const getAtletiByClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const atleti = await Atleta.findAll({
      where: { clubId },
      include: [
        {
          model: Club,
          as: 'club',
          attributes: { exclude: ['logo'] }
        },
        {
          model: ConfigTipoAtleta,
          as: 'tipoAtleta'
        }
      ],
      order: [['cognome', 'ASC'], ['nome', 'ASC']]
    });
    res.status(200).json(atleti);
  } catch (error) {
    logger.error(`Errore nel recupero degli atleti del club ${req.params.clubId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero degli atleti del club',
      details: error.message 
    });
  }
};

// Crea un nuovo atleta
const createAtleta = async (req, res) => {
  try {
    const dataNascita = req.body?.dataNascita;
    const tipoAtleta = req.body?.tipoAtleta;

    if (!checkAgeEligibility(dataNascita, tipoAtleta)) {
      logger.warn(`Tentativo di aggiunta atleta con dati di età non validi - ID: ${id}`);
      return res.status(400).json({
        error: 'L\'età dell\'atleta non è compatibile con il tipo di atleta selezionato'
      });
    }

    const newAtleta = await Atleta.create(req.body);
    logger.info(`Atleta creato - ID: ${newAtleta.id}, Nome: ${newAtleta.nome} ${newAtleta.cognome}`);
    res.status(201).json(newAtleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nella creazione atleta: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({
        error: 'Dati atleta non validi',
        details: error.errors.map(e => e.message)
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.warn(`Vincolo di unicità violato nella creazione atleta: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({
        error: 'Atleta gia\' registrato con questo codice fiscale',
        details: error.errors.map(e => e.message)
      });
    }

    logger.error(`Errore nella creazione dell'atleta: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nella creazione dell\'atleta',
      details: error.message 
    });
  }
};

// Aggiorna un atleta
const updateAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const dataNascita = req.body?.dataNascita;
    const tipoAtleta = req.body?.tipoAtleta;

    if (!checkAgeEligibility(dataNascita, tipoAtleta)) {
      logger.warn(`Tentativo di aggiornamento atleta con dati di età non validi - ID: ${id}`);
      return res.status(400).json({
        error: 'L\'età dell\'atleta non è compatibile con il tipo di atleta selezionato'
      });
    }

    const [updatedRowsCount] = await Atleta.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      logger.warn(`Tentativo aggiornamento atleta inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Atleta non trovato' });
    }

    const updatedAtleta = await Atleta.findByPk(id);
    logger.info(`Atleta aggiornato - ID: ${id}`);
    res.json(updatedAtleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nell'aggiornamento atleta ${req.params.id}: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nell'aggiornamento dell'atleta ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'aggiornamento dell\'atleta',
      details: error.message 
    });
  }
};

// Elimina un atleta
const deleteAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Atleta.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      logger.warn(`Tentativo eliminazione atleta inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Atleta non trovato' });
    }
    
    logger.info(`Atleta eliminato - ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Errore nell'eliminazione dell'atleta ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione dell\'atleta',
      details: error.message 
    });
  }
};

//------ Funzioni di supporto ------//

function checkAgeEligibility(dataNascita, tipoAtleta) {
  if (!dataNascita || !tipoAtleta) {
    throw new Error('Dati mancanti per la verifica dell\'età');
  }

  if (tipoAtleta.etaMinima === null || tipoAtleta.etaMassima === null) {
    throw new Error('Dati range età mancanti per la verifica dell\'età');
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const birthDate = new Date(dataNascita);
  const birthYear = birthDate.getFullYear();

  const age = currentYear - birthYear;
  if (age < tipoAtleta.etaMinima || age > tipoAtleta.etaMassima) {
    return false;
  }

  return true; 
}

module.exports = {
  getAllAtleti,
  getAtletiByClub,
  createAtleta,
  updateAtleta,
  deleteAtleta,
};
