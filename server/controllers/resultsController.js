// Controller per risultati generali (atleti e club)
const { SvolgimentoCategoria } = require('../models');
const { Op } = require('sequelize');
const { buildGlobalAthleteList, buildClubRanking } = require('../utils/resultsHelpers');

// GET /results/atleti
// GET /results/atleti
exports.getAtletiResults = async (req, res) => {
  try {
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ['id', 'categoriaId', 'classifica'],
      raw: true
    });

    const lista = await buildGlobalAthleteList(svolgimenti);

    res.json(lista);
  } catch (err) {
    console.error("ERRORE getAtletiResults:", err);
    res.status(500).json({ error: "Errore calcolo risultati atleti" });
  }
};


// GET /results/club
exports.getClubResults = async (req, res) => {
  try {
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ['id', 'categoriaId', 'classifica'],
      raw: true
    });

    const listaAtleti = await buildGlobalAthleteList(svolgimenti);
    const classificaClub = await buildClubRanking(listaAtleti);

    res.json(classificaClub);
  } catch (err) {
    console.error("ERRORE getClubResults:", err);
    res.status(500).json({ error: "Errore calcolo classifica club" });
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
