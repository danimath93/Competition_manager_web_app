const { Giudice } = require('../models');
const logger = require('../helpers/logger/logger');

// Ottieni tutti i judge
const getAllJudges = async (req, res) => {
  try {
    const judges = await Giudice.findAll({
      order: [['nome', 'ASC']]
    });
    res.json(judges);
  } catch (error) {
    logger.error(`Errore nel recupero dei giudici: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero dei giudici',
      details: error.message 
    });
  }
};

/* Ottieni un giudice per ID
const getJudgeById = async (req, res) => {
  try {
    const { id } = req.params;
    const judge = await Judge.findByPk(id, {
      include: ['atleti', 'giudici', 'competizioniOrganizzate']
    });
    
    if (!judge) {
      return res.status(404).json({ error: 'Giudice non trovato' });
    }
    
    res.json(judge);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero del club',
      details: error.message 
    });
  }
};*/

// Crea un nuovo giudice
const createJudge = async (req, res) => {
  try {
    const newjudge = await Giudice.create(req.body);
    logger.info(`Giudice creato - ID: ${newjudge.id}, Nome: ${newjudge.nome}`);
    res.status(201).json(newjudge);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nella creazione giudice: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nella creazione del giudice: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nella creazione del giudice',
      details: error.message 
    });
  }
};

// Aggiorna un giudice
const updateJudge = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Giudice.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      logger.warn(`Tentativo aggiornamento giudice inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Giudice non trovato' });
    }

    const updatedJudge = await Giudice.findByPk(id);
    logger.info(`Giudice aggiornato - ID: ${id}`);
    res.json(updatedJudge);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nell'aggiornamento giudice ${req.params.id}: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nell'aggiornamento del giudice ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'aggiornamento del giudice',
      details: error.message 
    });
  }
};

// Elimina un giudice
const deleteJudge = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Giudice.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      logger.warn(`Tentativo eliminazione giudice inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Giudice non trovato' });
    }
    
    logger.info(`Giudice eliminato - ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Errore nell'eliminazione del giudice ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nell\'eliminazione del giudice',
      details: error.message
    });
  }
};

module.exports = {
  getAllJudges,
  //getJudgeById,
  createJudge,
  updateJudge,
  deleteJudge
};
