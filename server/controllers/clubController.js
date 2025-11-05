const { Club } = require('../models');
const { Op } = require('sequelize');

// Ottieni tutti i club
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.findAll({
      include: ['atleti', 'giudici'],
  order: [['denominazione', 'ASC']]
    });
    res.json(clubs);
  } catch (error) {
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
    const club = await Club.findByPk(id, {
      include: ['atleti', 'giudici', 'competizioniOrganizzate']
    });
    
    if (!club) {
      return res.status(404).json({ error: 'Club non trovato' });
    }
    
    res.json(club);
  } catch (error) {
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
    res.status(201).json(club);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Club non trovato' });
    }
    
    const updatedClub = await Club.findByPk(id);
    res.json(updatedClub);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Club non trovato' });
    }
    
    res.status(204).send();
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Impossibile eliminare il club: esistono atleti o giudici associati'
      });
    }
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione del club',
      details: error.message 
    });
  }
};

const checkClubExists = async (req, res) => {
  try {
    const { codiceFiscale, partitaIva } = req.body; 
    const club = await Club.findOne({
      where: {
        [Op.or]: [  
          { codiceFiscale },
          { partitaIva }
        ]
      }
    });
    res.json({ exists: !!club });
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore durante la verifica del club',
      details: error.message 
    });
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  checkClubExists
};
