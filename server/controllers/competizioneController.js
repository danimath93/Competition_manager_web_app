const { Competizione, Categoria, Club } = require('../models');

// Ottieni tutte le competizioni
const getAllCompetizioni = async (req, res) => {
  try {
    const competizioni = await Competizione.findAll({
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore'
        }
      ],
      order: [['dataInizio', 'DESC']]
    });
    res.json(competizioni);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni',
      details: error.message 
    });
  }
};

// Ottieni una competizione per ID
const getCompetizioneById = async (req, res) => {
  try {
    const { id } = req.params;
    const competizione = await Competizione.findByPk(id, {
      include: [
        {
          model: Categoria,
          as: 'categorie',
          include: ['atleti', 'giudici']
        },
        {
          model: Club,
          as: 'organizzatore'
        }
      ]
    });
    
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    res.json(competizione);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero della competizione',
      details: error.message 
    });
  }
};

// Crea una nuova competizione
const createCompetizione = async (req, res) => {
  try {
    const competizione = await Competizione.create(req.body);
    res.status(201).json(competizione);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ 
      error: 'Errore nella creazione della competizione',
      details: error.message 
    });
  }
};

// Aggiorna una competizione
const updateCompetizione = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Competizione.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    const updatedCompetizione = await Competizione.findByPk(id);
    res.json(updatedCompetizione);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ 
      error: 'Errore nell\'aggiornamento della competizione',
      details: error.message 
    });
  }
};

// Elimina una competizione
const deleteCompetizione = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Competizione.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione della competizione',
      details: error.message 
    });
  }
};

// Ottieni competizioni per stato
const getCompetizioniByStato = async (req, res) => {
  try {
    const { stato } = req.params;
    const competizioni = await Competizione.findAll({
      where: { stato },
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore'
        }
      ],
      order: [['dataInizio', 'ASC']]
    });
    res.json(competizioni);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni',
      details: error.message 
    });
  }
};

module.exports = {
  getAllCompetizioni,
  getCompetizioneById,
  createCompetizione,
  updateCompetizione,
  deleteCompetizione,
  getCompetizioniByStato
};
