const { ConfigTipoCompetizione, ConfigTipoCategoria } = require('../models');

// Ottieni tutti i tipi di competizione
const getAllTipiCompetizione = async (req, res) => {
  try {
    const tipiCompetizione = await ConfigTipoCompetizione.findAll({
      where: { attivo: true },
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipiCategoria',
          where: { attivo: true },
          required: false, // LEFT JOIN per includere anche tipi senza categorie
          order: [['nome', 'ASC']]
        }
      ],
      order: [['id', 'ASC']]
    });
    res.json(tipiCompetizione);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero dei tipi di competizione',
      details: error.message 
    });
  }
};

// Ottieni un tipo di competizione specifico con le sue categorie
const getTipoCompetizioneById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoCompetizione = await ConfigTipoCompetizione.findByPk(id, {
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipiCategoria',
          where: { attivo: true },
          required: false,
          order: [['nome', 'ASC']]
        }
      ]
    });

    if (!tipoCompetizione) {
      return res.status(404).json({ error: 'Tipo di competizione non trovato' });
    }

    res.json(tipoCompetizione);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero del tipo di competizione',
      details: error.message 
    });
  }
};

// Ottieni tutte le categorie di un tipo di competizione specifico
const getCategorieByTipoCompetizione = async (req, res) => {
  try {
    const { tipoCompetizioneId } = req.params;
    
    const categorie = await ConfigTipoCategoria.findAll({
      where: { 
        tipoCompetizioneId,
        attivo: true 
      },
      include: [
        {
          model: ConfigTipoCompetizione,
          as: 'tipoCompetizione'
        }
      ],
      order: [['nome', 'ASC']]
    });

    res.json(categorie);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero delle categorie',
      details: error.message 
    });
  }
};

// Ottieni tutti i tipi di categoria (indipendentemente dal tipo di competizione)
const getAllTipiCategoria = async (req, res) => {
  try {
    const tipiCategoria = await ConfigTipoCategoria.findAll({
      where: { attivo: true },
      include: [
        {
          model: ConfigTipoCompetizione,
          as: 'tipoCompetizione'
        }
      ],
      order: [['tipoCompetizioneId', 'ASC'], ['nome', 'ASC']]
    });
    res.json(tipiCategoria);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero dei tipi di categoria',
      details: error.message 
    });
  }
};

module.exports = {
  getAllTipiCompetizione,
  getTipoCompetizioneById,
  getCategorieByTipoCompetizione,
  getAllTipiCategoria
};