// server/helpers/resultsHelpers.js
const { Atleta } = require("../models");

/**
 * Ritorna tutte le medaglie aggregate per atleta
 * classifica = [
 *   { pos: 1, atletaId: 107 },
 *   { pos: 2, atletaId: 254 },
 *   { pos: 3, atletaId: 231 },
 *   { pos: 3, atletaId: 259 }
 * ]
 */

function convertPosToMedal(pos) {
  if (pos === 1) return "oro";
  if (pos === 2) return "argento";
  if (pos === 3) return "bronzo";
  return null;
}

/**
 * Aggrega tutte le medaglie di un atleta
 */
async function buildGlobalAthleteList(svolgimenti) {
  const medalMap = {}; // { atletaId: { oro: n, argento: n, bronzo: n } }

  for (const s of svolgimenti) {
    if (!Array.isArray(s.classifica)) continue;

    for (const entry of s.classifica) {
      const medal = convertPosToMedal(entry.pos);
      if (!medal) continue;

      const id = entry.atletaId;
      if (!id) continue;

      if (!medalMap[id]) {
        medalMap[id] = { oro: 0, argento: 0, bronzo: 0 };
      }
      medalMap[id][medal]++;
    }
  }

  // Recupero i dati reali dell’atleta dal DB
  const athleteIds = Object.keys(medalMap);
  const athletes = await Atleta.findAll({
    where: { id: athleteIds },
  });

  // Creo l’output finale
  return athletes.map((a) => ({
    atletaId: a.id,
    nome: a.nome,
    cognome: a.cognome,
    club: a.club,
    medaglie: medalMap[a.id],
  }));
}

/**
 * Classifica club
 */
async function buildClubRanking(athleteMedals) {
  const clubMap = {};

  for (const a of athleteMedals) {
    const club = a.club || "Senza Club";
    if (!clubMap[club]) {
      clubMap[club] = { oro: 0, argento: 0, bronzo: 0, dettagli: [] };
    }

    const { oro, argento, bronzo } = a.medaglie;
    clubMap[club].oro += oro;
    clubMap[club].argento += argento;
    clubMap[club].bronzo += bronzo;

    // dettagli atleta
    if (oro > 0 || argento > 0 || bronzo > 0) {
      clubMap[club].dettagli.push({
        atletaId: a.atletaId,
        nome: a.nome,
        cognome: a.cognome,
        oro,
        argento,
        bronzo,
      });
    }
  }

  // trasformo in array ordinato
  return Object.entries(clubMap)
    .map(([club, data]) => ({
      club,
      ...data,
    }))
    .sort((a, b) => {
      if (b.oro !== a.oro) return b.oro - a.oro;
      if (b.argento !== a.argento) return b.argento - a.argento;
      return b.bronzo - a.bronzo;
    });
}

module.exports = {
  buildGlobalAthleteList,
  buildClubRanking,
};
