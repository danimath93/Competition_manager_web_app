const { ConfigTipoCompetizione, ConfigTipoCategoria, ConfigGruppoEta, ConfigTipoAtleta, ConfigEsperienza } = require('../models');

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

// Ottieni un tipo categoria specifico
const getTipoCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoCategoria = await ConfigTipoCategoria.findByPk(id, {
      include: [
        {
          model: ConfigTipoCompetizione,
          as: 'tipoCompetizione'
        }
      ]
    });

    if (!tipoCategoria) {
      return res.status(404).json({ error: 'Tipo categoria non trovato' });
    }

    res.json(tipoCategoria);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero del tipo categoria',
      details: error.message 
    });
  }
};

// Ottieni tutti i gruppi età
const getAllGruppiEta = async (req, res) => {
  try {
    const gruppiEta = await ConfigGruppoEta.findAll({
      where: { attivo: true },
      order: [['ordine', 'ASC'], ['etaMinima', 'ASC']]
    });
    res.json(gruppiEta);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero dei gruppi età',
      details: error.message 
    });
  }
};

const getAllTipiAtleta = async (req, res) => {
  try {
    const tipiAtleta = await ConfigTipoAtleta.findAll({
      include: [
        {
          model: ConfigEsperienza,
          as: 'esperienze',
          where: { attivo: true },
          required: false
        }
      ],
      order: [['id', 'ASC']]
    });
    res.json(tipiAtleta);
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero dei tipi atleta',
      details: error.message
    });
  }
};

const getTipoAtletaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoAtleta = await ConfigTipoAtleta.findByPk(id, {
      include: [
        {
          model: ConfigEsperienza,
          as: 'esperienze',
          where: { attivo: true },
          required: false
        }
      ]
    });
    if (!tipoAtleta) {
      return res.status(404).json({ error: 'Tipo atleta non trovato' });
    }
    res.json(tipoAtleta);
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero del tipo atleta',
      details: error.message
    });
  }
};

const getAllEsperienze = async (req, res) => {
  try {
    const esperienze = await ConfigEsperienza.findAll({
      where: { attivo: true },
      include: [
        {
          model: ConfigTipoAtleta,
          as: 'tipoAtleta'
        }
      ],
      order: [['idConfigTipoAtleta', 'ASC'], ['id', 'ASC']]
    });
    res.json(esperienze);
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero delle esperienze',
      details: error.message
    });
  }
};

const getEsperienzaById = async (req, res) => {
  try {
    const { id } = req.params;
    const esperienza = await ConfigEsperienza.findByPk(id, {
      include: [
        {
          model: ConfigTipoAtleta,
          as: 'tipoAtleta'
        }
      ]
    });
    if (!esperienza) {
      return res.status(404).json({ error: 'Esperienza non trovata' });
    }
    res.json(esperienza);
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero dell\'esperienza',
      details: error.message
    });
  }
};

const getEsperienzeByTipoAtleta = async (req, res) => {
  try {
    const { tipoAtletaId } = req.params;
    const esperienze = await ConfigEsperienza.findAll({
      where: { 
        idConfigTipoAtleta: tipoAtletaId,
        attivo: true 
      },
      order: [['id', 'ASC']]
    });
    res.json(esperienze);
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero delle esperienze per tipo atleta',
      details: error.message
    });
  }
};

module.exports = {
  getAllTipiCompetizione,
  getTipoCompetizioneById,
  getCategorieByTipoCompetizione,
  getAllTipiCategoria,
  getTipoCategoriaById,
  getAllGruppiEta,
  getAllTipiAtleta,
  getTipoAtletaById,
  getAllEsperienze,
  getEsperienzaById,
  getEsperienzeByTipoAtleta
};