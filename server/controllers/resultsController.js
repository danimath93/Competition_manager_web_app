// Controller per risultati generali (atleti e club)
const { SvolgimentoCategoria } = require('../models');
const { Op } = require('sequelize');
const { buildGlobalAthleteList, buildClubRanking, computeAthletePoints, assignAgeGroupAndTipo, bestAthletesByTipoFascia } = require('../utils/resultsHelpers');

// GET /results/atleti
exports.getAtletiResults = async (req, res) => {
  try {
  console.log('[resultsController] getAtletiResults - query:', req.query);
    const where = {};
    const competitionId = req.query.competitionId || req.query.competizioneId;
  console.log('[resultsController] getAtletiResults - competitionId resolved:', competitionId || null);
    if (competitionId) where.competizioneId = competitionId;
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ["id", "categoriaId", "classifica", "competizioneId"],
      where,
      raw: true
    });

    // lista con medaglie
    let lista = await buildGlobalAthleteList(svolgimenti);

    // punti
    lista = computeAthletePoints(lista);

    // aggiungo tipo e fascia
    lista = await assignAgeGroupAndTipo(lista);

    // migliori raggruppati
    const miglioriPerFasce = bestAthletesByTipoFascia(lista);

    res.json({
      atleti: lista,
      miglioriPerFasce
    });

  } catch (err) {
    res.status(500).json({ error: "Errore calcolo risultati per fasce", details: err.message });
  }
};


// GET /results/club
exports.getClubResults = async (req, res) => {
  try {
  console.log('[resultsController] getClubResults - query:', req.query);
    const where = {};
    const competitionId = req.query.competitionId || req.query.competizioneId;
  console.log('[resultsController] getClubResults - competitionId resolved:', competitionId || null);
    if (competitionId) where.competizioneId = competitionId;
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ['id', 'categoriaId', 'classifica', 'competizioneId'],
      where,
      raw: true
    });

    // lista atleti già completa di club
    const listaAtleti = await buildGlobalAthleteList(svolgimenti);

    // classifica club come array già ordinato
    const classifica = await buildClubRanking(listaAtleti);

    // arricchiamo con:
    // - punti totali
    // - id fittizio (denominazione)
    const final = classifica.map(c => {
      const punti = (c.oro * 7) + (c.argento * 4) + (c.bronzo * 2);
      return {
        clubId: c.club,  // uso la denominazione come ID coerente col frontend
        club: c.club,
        ori: c.oro,
        argenti: c.argento,
        bronzi: c.bronzo,
        punti,
        dettagli: c.dettagli
      };
    });

    // podio = primi 3
    const podio = final.slice(0, 3);

    res.json({
      podio,
      classifica: final
    });

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
  console.log('[resultsController] getClubMedalsDetails - params:', req.params, 'query:', req.query);
    const where = {};
    const competitionId = req.query.competitionId || req.query.competizioneId;
  console.log('[resultsController] getClubMedalsDetails - competitionId resolved:', competitionId || null);
    if (competitionId) where.competizioneId = competitionId;
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ['id', 'categoriaId', 'classifica', 'competizioneId'],
      where,
      raw: true
    });

    const dettagli = await dettagliMedaglieClub(svolgimenti, clubId);
    res.json(dettagli);
  } catch (err) {
    res.status(500).json({ error: 'Errore dettaglio medaglie club', details: err.message });
  }
};


async function dettagliMedaglieClub(svolgimenti, clubId) {

  const athleteList = await buildGlobalAthleteList(svolgimenti);

  const filtered = athleteList.filter(a => {
    return String(a.club).toLowerCase() === String(clubId).toLowerCase();
  });

  const out = filtered.map(a => ({
    atletaId: a.atletaId,
    nome: a.nome,
    cognome: a.cognome,
    ori: a.medaglie.oro,
    argenti: a.medaglie.argento,
    bronzi: a.medaglie.bronzo
  }));

  return { atleti: out };
}