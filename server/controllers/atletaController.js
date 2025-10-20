const {Atleta, Club, ConfigGradoCintura } = require('../models');

// Ottieni tutti gli atleti
const getAllAtleti = async (req, res) => {
  try {
    const atleti = await Atleta.findAll({
      include: [
        {
          model: Club,
          as: 'club'
        },
        {
          model: ConfigGradoCintura,
          as: 'gradoCintura'
        }
      ],
      order: [['cognome', 'ASC']]
      // ordinati anche per club
    });
    res.status(200).json(atleti);
  } catch (error) {
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
          as: 'club'
        },
        {
          model: ConfigGradoCintura,
          as: 'gradoCintura'
        }
      ],
      order: [['cognome', 'ASC'], ['nome', 'ASC']]
    });
    res.status(200).json(atleti);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero degli atleti del club',
      details: error.message 
    });
  }
};

// Crea un nuovo atleta
const createAtleta = async (req, res) => {
  try {
    const newAtleta = await Atleta.create(req.body);
    res.status(201).json(newAtleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
    const [updatedRowsCount] = await Atleta.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Atleta non trovato' });
    }

    const updatedAtleta = await Atleta.findByPk(id);
    res.json(updatedAtleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Atleta non trovato' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione dell\'atleta',
      details: error.message 
    });
  }
};

module.exports = {
  getAllAtleti,
  getAtletiByClub,
  // getAtletiById,
  createAtleta,
  updateAtleta,
  deleteAtleta,
};
