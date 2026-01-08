const DettaglioIscrizioneAtleta = require('../models/DettaglioIscrizioneAtleta');
const Atleta = require('../models/Atleta');
const { Op } = require('sequelize');

// Crea un nuovo dettaglio iscrizione atleta
exports.createDettaglio = async (req, res) => {
  try {
    const dettaglio = await DettaglioIscrizioneAtleta.create(req.body);
    res.status(201).json(dettaglio);
  } catch (err) {
    res.status(400).json({ error: 'Errore creazione dettaglio', details: err.message });
  }
};

// Ottieni tutti i dettagli iscrizione atleti (con filtri opzionali)
exports.getAllDettagli = async (req, res) => {
  try {
    const where = {};
    if (req.query.atletaId) where.atletaId = req.query.atletaId;
    if (req.query.competizioneId) where.competizioneId = req.query.competizioneId;
    const dettagli = await DettaglioIscrizioneAtleta.findAll({
      where,
      include: [{ model: Atleta, as: 'atleta' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(dettagli);
  } catch (err) {
    res.status(500).json({ error: 'Errore caricamento dettagli', details: err.message });
  }
};

// Ottieni dettaglio per ID
exports.getDettaglioById = async (req, res) => {
  try {
    const dettaglio = await DettaglioIscrizioneAtleta.findByPk(req.params.id, {
      include: [{ model: Atleta, as: 'atleta' }]
    });
    if (!dettaglio) return res.status(404).json({ error: 'Dettaglio non trovato' });
    res.json(dettaglio);
  } catch (err) {
    res.status(500).json({ error: 'Errore caricamento dettaglio', details: err.message });
  }
};

// Aggiorna dettaglio
exports.updateDettaglio = async (req, res) => {
  try {
    const [updated] = await DettaglioIscrizioneAtleta.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Dettaglio non trovato' });
    const dettaglio = await DettaglioIscrizioneAtleta.findByPk(req.params.id);
    res.json(dettaglio);
  } catch (err) {
    res.status(400).json({ error: 'Errore aggiornamento dettaglio', details: err.message });
  }
};

// Elimina dettaglio
exports.deleteDettaglio = async (req, res) => {
  try {
    const deleted = await DettaglioIscrizioneAtleta.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Dettaglio non trovato' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Errore eliminazione dettaglio', details: err.message });
  }
};
