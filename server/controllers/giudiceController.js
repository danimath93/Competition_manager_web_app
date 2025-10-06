const { Giudice } = require('../models');

// Ottieni tutti i judge
const getAllJudges = async (req, res) => {
  try {
    const judges = await Giudice.findAll({
      order: [['nome', 'ASC']]
    });
    res.json(judges);
  } catch (error) {
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
    res.status(201).json({ message: 'Giudice creato con successo', judge: newjudge });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Giudice non trovato' });
    }
    
    const updatedJudge = await Judge.findByPk(id);
    res.json({ message: 'Giudice aggiornato con successo', athlete: updatedJudge });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Giudice non trovato' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione del club',
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
