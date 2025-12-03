// Controller per risultati generali (atleti e club)
const { SvolgimentoCategoria } = require('../models');
const { Op } = require('sequelize');
const { buildGlobalAthleteList, buildClubRanking, computeAthletePoints, findBestAthletesByGender } = require('../utils/resultsHelpers');

// GET /results/atleti
// GET /results/atleti
exports.getAtletiResults = async (req, res) => {
  try {
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ['id', 'categoriaId', 'classifica'],
      raw: true
    });

    // costruisci la lista aggregata degli atleti con le loro medaglie
    const lista = await buildGlobalAthleteList(svolgimenti);

    // calcola i punti per ciascun atleta (oro=7, argento=4, bronzo=2)
    const listaConPunti = computeAthletePoints(lista);
    const best = findBestAthletesByGender(listaConPunti);
    // restituisci la lista con i punti al client
    res.json({
      atleti: listaConPunti,
      migliori: best
    });
  } catch (err) {
    console.error("ERRORE getAtletiResults:", err);
    res.status(500).json({ error: "Errore calcolo risultati atleti", details: err.message });
  }
};


// GET /results/club
exports.getClubResults = async (req, res) => {
  try {
    const svolgimenti = await SvolgimentoCategoria.findAll({
      attributes: ['id', 'categoriaId', 'classifica'],
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
    const svolgimenti = await SvolgimentoCategoria.findAll({
    attributes: ['id', 'categoriaId', 'classifica'],
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