const { Club } = require('../models');
const { Op } = require('sequelize');
const logger = require('../helpers/logger/logger');

// Ottieni tutti i club
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.findAll({
      include: ['atleti', 'giudici'],
  order: [['denominazione', 'ASC']]
    });
    res.json(clubs);
  } catch (error) {
    logger.error(`Errore nel recupero dei club: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero dei club',
      details: error.message 
    });
  }
};

// Ottieni un club per ID
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.scope('withLogo').findByPk(id, {
      include: ['atleti', 'giudici', 'competizioniOrganizzate']
    });

    if (!club) {
      logger.warn(`Tentativo recupero club inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Club non trovato' });
    }

    res.json(club);
  } catch (error) {
    logger.error(`Errore nel recupero del club ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero del club',
      details: error.message 
    });
  }
};

// Crea un nuovo club
const createClub = async (req, res) => {
  try {
    const club = await Club.create(req.body);
    logger.info(`Club creato - ID: ${club.id}, Denominazione: ${club.denominazione}`);
    res.status(201).json(club);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nella creazione club: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nella creazione del club: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nella creazione del club',
      details: error.message 
    });
  }
};

// Aggiorna un club
const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Club.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      logger.warn(`Tentativo aggiornamento club inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Club non trovato' });
    }
    
    const updatedClub = await Club.scope('withLogo').findByPk(id);
    logger.info(`Club aggiornato - ID: ${id}`);
    res.json(updatedClub);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nell'aggiornamento club ${req.params.id}: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.warn(`Vincolo di unicità violato nell'aggiornamento club ${req.params.id}: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nell'aggiornamento del club ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'aggiornamento del club',
      details: error.message 
    });
  }
};

// Elimina un club
const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Club.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      logger.warn(`Tentativo eliminazione club inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Club non trovato' });
    }
    
    logger.info(`Club eliminato - ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      logger.warn(`Tentativo eliminazione club con dipendenze - ID: ${req.params.id}`);
      return res.status(400).json({ 
        error: 'Impossibile eliminare il club: esistono atleti o giudici associati'
      });
    }
    logger.error(`Errore nell'eliminazione del club ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione del club',
      details: error.message 
    });
  }
};

// Helper function per verificare se un club esiste (per uso interno)
const checkClubExistsHelper = async ({ codiceFiscale, partitaIva }) => {
  const club = await Club.findOne({
    where: {
      [Op.or]: [  
        { codiceFiscale },
        { partitaIva }
      ]
    }
  });
  return !!club;
};

// Endpoint API per verificare se un club esiste
const checkClubExists = async (req, res) => {
  try {
    const { codiceFiscale, partitaIva } = req.body; 
    const exists = await checkClubExistsHelper({ codiceFiscale, partitaIva });
    res.json({ exists });
  } catch (error) {
    logger.error(`Errore durante la verifica del club: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore durante la verifica del club',
      details: error.message 
    });
  }
};

const uploadLogoClub = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file inviato.' });
    }
    const file = req.file;
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return res.status(400).json({ error: 'Solo file JPEG o PNG ammessi.' });
    }
    if (file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File troppo grande (max 2MB).' });
    }
    const club = await Club.findByPk(id);
    if (!club) {
      return res.status(404).json({ error: 'Club non trovato.' });
    }
    club.logo = file.buffer;
    club.logoType = file.mimetype;
    await club.save();
    res.json(club);
  } catch (error) {
    logger.error(`Errore durante l'upload del logo per il club ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Errore upload logo', details: error.message });
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  checkClubExists,
  checkClubExistsHelper,
  uploadLogoClub,
};
