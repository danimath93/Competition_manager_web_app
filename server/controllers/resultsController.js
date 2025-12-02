// Controller per risultati generali (atleti e club)
const { SvolgimentoCategoria } = require('../models');
const { Op } = require('sequelize');
const { calcolaRisultatiAtleti, calcolaRisultatiClub, dettagliMedaglieClub } = require('../utils/resultsHelpers');

// GET /results/atleti
// Restituisce la classifica atleti per fascia di età e genere
exports.getAtletiResults = async (req, res) => {
  try {
    // Recupera tutte le classifiche svolgimento categorie
    const svolgimenti = await SvolgimentoCategoria.findAll({
    attributes: ['id', 'categoriaId', 'classifica'],
    raw: true
    });

    const risultati = calcolaRisultatiAtleti(svolgimenti);
    res.json(risultati);
  } catch (err) {
    res.status(500).json({ error: 'Errore calcolo risultati atleti', details: err.message });
  }
};

// GET /results/club
// Restituisce la classifica club aggregata
exports.getClubResults = async (req, res) => {
  try {
    const svolgimenti = await SvolgimentoCategoria.findAll({
    attributes: ['id', 'categoriaId', 'classifica'],
    raw: true
    });

    const risultati = calcolaRisultatiClub(svolgimenti);
    res.json(risultati);
  } catch (err) {
    res.status(500).json({ error: 'Errore calcolo risultati club', details: err.message });
  }
};

// GET /results/club/:id
// Restituisce il dettaglio delle medaglie per un club
exports.getClubMedalsDetails = async (req, res) => {
  try {
    const clubId = req.params.id;
    const svolgimenti = await SvolgimentoCategoria.findAll({
    attributes: ['id', 'categoriaId', 'classifica'],
    raw: true
    });

    const dettagli = dettagliMedaglieClub(svolgimenti, clubId);
    res.json(dettagli);
  } catch (err) {
    res.status(500).json({ error: 'Errore dettaglio medaglie club', details: err.message });
  }
};
