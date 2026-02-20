// server/helpers/resultsHelpers.js
const { Atleta, Club, ConfigGruppoEta, ConfigTipoAtleta } = require("../models");

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
      include: [
    {
      model: Club,
      as: "club",
      attributes: ["abbreviazione", "denominazione"]
    }
  ],
    where: { id: athleteIds },
  });

  // Creo l’output finale
  return athletes.map((a) => ({
      atletaId: a.id,
      nome: a.nome,
      cognome: a.cognome,
      clubAbbr: a.club?.abbreviazione,
      club: a.club?.denominazione,
      sesso: a.sesso,
      dataNascita: a.dataNascita,
      tipoAtletaId: a.tipoAtletaId,
      medaglie: medalMap[a.id]
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

    // Fix: default medaglie se undefined
    const { oro = 0, argento = 0, bronzo = 0 } = a.medaglie || {};
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

function computeAthletePoints(athletes) {
  return athletes.map(a => {
    const gold = a.medaglie?.oro || 0;
    const silver = a.medaglie?.argento || 0;
    const bronze = a.medaglie?.bronzo || 0;

    const punti = gold * 7 + silver * 4 + bronze * 2;

    return { ...a, punti };
  });
}

function findBestAthletesByGender(athletes) {
  // Normalizziamo eventuali undefined
  const safe = athletes.map(a => ({
    ...a,
    punti: Number(a.punti) || 0
  }));

  const males = safe.filter(a => a.sesso === "M");
  const females = safe.filter(a => a.sesso === "F");

  const bestM = [];
  const bestF = [];

  // --- MASCHI ---
  if (males.length > 0) {
    const maxM = Math.max(...males.map(a => a.punti));
    males.forEach(a => {
      if (a.punti === maxM) bestM.push(a);
    });
  }

  // --- FEMMINE ---
  if (females.length > 0) {
    const maxF = Math.max(...females.map(a => a.punti));
    females.forEach(a => {
      if (a.punti === maxF) bestF.push(a);
    });
  }

  return {
    maschi: bestM,
    femmine: bestF
  };
}

async function assignAgeGroupAndTipo(athletes, competizioneInizio) {

  const gruppi = await ConfigGruppoEta.findAll();
  const tipi = await ConfigTipoAtleta.findAll();

  const tipoMap = {};
  tipi.forEach(t => tipoMap[t.id] = t.nome);

  // Calcola età in anni
  function getAge(dateNascita, dataInizio) {
    if (!dateNascita || !dataInizio) return undefined;
    const birthDate = new Date(dateNascita);
    const refDate = new Date(dataInizio);
    let age = refDate.getYear() - birthDate.getYear();
    return age;
  }

  return athletes.map(a => {
    let fascia = null;
    let fasciaEtaNote = undefined;
    let eta = undefined;
    let nascitaDate = undefined;
    
    if (a.dataNascita) {
      eta = getAge(a.dataNascita, competizioneInizio?.dataInizio);
      nascitaDate = new Date(a.dataNascita);
      // Primo tentativo: inizioValidità/fineValidità, Secondo tentativo: etaMinima/etaMassima
      for (const g of gruppi) {
        if (g.inizioValidita!=null){
          const start = g.inizioValidita ? new Date(g.inizioValidita) : null;
          const end = g.fineValidita ? new Date(g.fineValidita) : null;
          if ((!start || nascitaDate >= start) && (!end || nascitaDate <= end)) {
            fascia = g.nome;
            fasciaEtaNote = `Assegnato tramite data validità gruppo (nascita: ${a.dataNascita}, gruppo: ${g.nome})`;
            break;
          }
        } else if (g.etaMinima <= eta && eta <= g.etaMassima) {
            fascia = g.nome;
            fasciaEtaNote = `Assegnato tramite fascia d'età (nascita: ${a.dataNascita}, gruppo: ${g.nome}, età: ${eta})`;
            break;
          }
      }  
      if (!fascia) {
        fasciaEtaNote = `Età atleta: ${eta}, data di nascita ${a.dataNascita} fuori da tutti i gruppi [${gruppi.map(g=>g.nome+':'+g.etaMinima+'-'+g.etaMassima).join(', ')}] e nessuna data validità compatibile`;
      }
    } else {
      fasciaEtaNote = 'Data di nascita mancante';
    }/*
    if (a.dataNascita) {
      eta = getAge(a.dataNascita, competizioneInizio?.dataInizio);
      nascitaDate = new Date(a.dataNascita);
      // Primo tentativo: etaMinima/etaMassima
      
      for (const g of gruppi) {
        if (g.etaMinima <= eta && eta <= g.etaMassima) {
          fascia = g.nome;
          fasciaEtaNote = `Assegnato tramite fascia d'età (nascita: ${a.dataNascita}, gruppo: ${g.nome}, età: ${eta})`;
          break;
        }
      }
      // Secondo tentativo: inizioValidita/fineValidita
      if (!fascia) {
        for (const g of gruppi) {
          if (g.inizioValidita!=null){
            const start = g.inizioValidita ? new Date(g.inizioValidita) : null;
            const end = g.fineValidita ? new Date(g.fineValidita) : null;
            if ((!start || nascitaDate >= start) && (!end || nascitaDate <= end)) {
              fascia = g.nome;
              fasciaEtaNote = `Assegnato tramite data validità gruppo (nascita: ${a.dataNascita}, gruppo: ${g.nome})`;
              break;
            }
          }
        }
      }
      if (!fascia) {
        fasciaEtaNote = `Età atleta: ${eta}, data di nascita ${a.dataNascita} fuori da tutti i gruppi [${gruppi.map(g=>g.nome+':'+g.etaMinima+'-'+g.etaMassima).join(', ')}] e nessuna data validità compatibile`;
      }
    } else {
      fasciaEtaNote = 'Data di nascita mancante';
    }*/

    return {
      ...a,
      tipoAtleta: tipoMap[a.tipoAtletaId] || "Sconosciuto",
      fasciaEta: fascia || "Non Definita",
      fasciaEtaNote
    };
  });
}

function bestAthletesByTipoFascia(athletes) {

  // Raggruppo struttura:
  // tipoAtleta -> fasciaEta -> sesso -> array di atleti
  const groups = {};

  for (const a of athletes) {

    if (!groups[a.tipoAtleta]) groups[a.tipoAtleta] = {};
    if (!groups[a.tipoAtleta][a.fasciaEta]) groups[a.tipoAtleta][a.fasciaEta] = { M: [], F: [] };

    groups[a.tipoAtleta][a.fasciaEta][a.sesso].push(a);
  }

  // Prendo il migliore per ogni gruppo
  const final = {};

  for (const tipo in groups) {
    final[tipo] = {};

    for (const fascia in groups[tipo]) {
      final[tipo][fascia] = {};

      ["M", "F"].forEach(sex => {
        const arr = groups[tipo][fascia][sex];
        if (arr.length === 0) return final[tipo][fascia][sex] = [];

        const max = Math.max(...arr.map(a => a.punti));
        final[tipo][fascia][sex] = arr.filter(a => a.punti === max);
      });
    }
  }

  return final;
}

module.exports = {
  buildGlobalAthleteList,
  buildClubRanking,
  computeAthletePoints,
  findBestAthletesByGender,
  assignAgeGroupAndTipo,
  bestAthletesByTipoFascia
};
