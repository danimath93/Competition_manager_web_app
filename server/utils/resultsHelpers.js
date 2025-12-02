// server/utils/resultsHelpers.js
// Funzioni di calcolo risultati generali atleti e club
const FASCE_ETA = [
  { nome: 'Pulcini', min: 4, max: 6 },
  { nome: 'Bambini', min: 7, max: 8 },
  { nome: 'Esordienti', min: 9, max: 11 },
  { nome: 'Cadetti', min: 12, max: 14 },
  { nome: 'Junior', min: 15, max: 17 },
  { nome: 'Seniores', min: 18, max: 39 },
  { nome: 'Masters A', min: 40, max: 49 },
  { nome: 'Masters B', min: 50, max: 120 }
];

const PUNTI = [7, 4, 2, 2]; // oro, argento, bronzo, bronzo ex-aequo

function estraiFasciaEta(nomeCategoria) {
  if (!nomeCategoria) return 'Altro';

  const lower = nomeCategoria.toLowerCase();

  //
  // 1. Controllo prefisso CN o CB all’inizio
  //
  // Esempi validi:
  //   H.CN - Seniores
  //   U.CB - Masters A
  //
  let tipoLivello = 'CB Bianche'; // default per Junior/Seniores/Masters
  if (lower.includes('cn')) tipoLivello = 'CN';
  else if (lower.includes('cb')) tipoLivello = 'CB Bianche';

  //
  // 2. Controllo fascia effettiva
  //
  if (lower.includes('pulcini')) return 'Pulcini';
  if (lower.includes('bambini')) return 'Bambini';
  if (lower.includes('esordienti')) return 'Esordienti';
  if (lower.includes('cadetti')) return 'Cadetti';

  // Junior → sempre CB Bianche
  if (lower.includes('junior')) return 'CB Bianche';

  // Seniores → CB Bianche o CN
  if (lower.includes('seniores')) return `Seniores ${tipoLivello}`;

  // Masters A → CB Bianche o CN
  if (lower.includes('masters a')) return `Masters A ${tipoLivello}`;

  // Masters B → CB Bianche o CN
  if (lower.includes('masters b')) return `Masters B ${tipoLivello}`;

  return 'Altro';
}


// Normalizza una posizione (pos) presa dalla colonna `classifica`
// Gestisce forme diverse:
//  - { atleta: { id, nome, cognome, clubId, club, categoriaNome, genere } }
//  - { id, nome, cognome, club, clubId, ... }  (caso bracket)
//  - { media: .., atleta: {...} } (quyen)
// Restituisce { atleta: {...}, posizioneIndex: idx? } (posizione index la deve passare il chiamante)
function normalizePos(pos) {
  if (!pos) return null;

  // caso: { atleta: { ... } } (spesso snapshot con campo atleta.atletaId)
  if (pos.atleta) {
    const a = pos.atleta;
    const realId = a.atletaId || a.atleta_id || a.id || null; // preferisci atletaId quando disponibile
    return {
      id: realId,
      nome: a.nome || '',
      cognome: a.cognome || '',
      club: a.club || a.clubName || '',
      clubId: a.clubId || a.club_id || null,
      categoriaNome: a.categoriaNome || a.categoria || null,
      genere: a.genere || a.sesso || null
    };
  }

  // caso: oggetto atleta diretto (bracket case o forma semplificata)
  if (pos.id || pos.nome) {
    return {
      id: pos.atletaId || pos.id || null, // preferisci atletaId se presente
      nome: pos.nome || pos.firstName || '',
      cognome: pos.cognome || pos.lastName || '',
      club: pos.club || pos.clubName || '',
      clubId: pos.clubId || pos.clubeId || null,
      categoriaNome: pos.categoriaNome || pos.categoria || null,
      genere: pos.genere || pos.sesso || null
    };
  }

  return null;
}

function calcolaRisultatiAtleti(svolgimenti) {
  const atletiMap = {};
  const medagliati = [];

  svolgimenti.forEach(({ classifica }) => {
    if (!Array.isArray(classifica)) return;
    classifica.forEach((pos, idx) => {
      const atletaObj = normalizePos(pos);
      if (!atletaObj || !atletaObj.id) return;

      const key = atletaObj.id;
      if (!atletiMap[key]) {
        atletiMap[key] = {
          id: atletaObj.id,
          nome: atletaObj.nome,
          cognome: atletaObj.cognome,
          club: atletaObj.club || '',
          clubId: atletaObj.clubId || null,
          punti: 0,
          ori: 0,
          argenti: 0,
          bronzi: 0,
          medaglie: [],
          // fascia e genere: cerchiamo la fonte migliore
          fascia: estraiFasciaEta(atletaObj.categoriaNome || ''),
          genere: atletaObj.genere || 'U'
        };
      }
console.log("ATLETA NORMALIZZATO:", atletaObj);
      const punti = PUNTI[idx] || 0;
      atletiMap[key].punti += punti;
      if (idx === 0) { atletiMap[key].ori++; atletiMap[key].medaglie.push('oro'); }
      else if (idx === 1) { atletiMap[key].argenti++; atletiMap[key].medaglie.push('argento'); }
      else if (idx >= 2) { atletiMap[key].bronzi++; atletiMap[key].medaglie.push('bronzo'); }
    });
  });
  
  // Raggruppa per fascia e genere
  const fasce = {};
  Object.values(atletiMap).forEach(a => {
    if (a.ori + a.argenti + a.bronzi === 0) return;
    const key = `${a.fascia}-${a.genere || 'U'}`;
    if (!fasce[key]) fasce[key] = [];
    fasce[key].push(a);
    medagliati.push(a);
  });

  // Trova migliori per ogni fascia/genere
  const migliori = {};
  Object.entries(fasce).forEach(([key, arr]) => {
    const max = Math.max(...arr.map(a => a.punti));
    migliori[key] = arr.filter(a => a.punti === max);
  });

  // Classifica completa
  medagliati.sort((a, b) => b.punti - a.punti || b.ori - a.ori || b.argenti - a.argenti || b.bronzi - a.bronzi);

  return {
    migliori,
    classifica: medagliati
  };
}

function calcolaRisultatiClub(svolgimenti) {
  const clubMap = {};
  svolgimenti.forEach(({ classifica }) => {
    if (!Array.isArray(classifica)) return;
    classifica.forEach((pos, idx) => {
      const atleta = normalizePos(pos);
      if (!atleta || !atleta.id) return;
      const clubId = atleta.clubId || atleta.club || ('club_'+(atleta.club || 'unknown')); // fallback se manca clubId
      if (!clubMap[clubId]) {
        clubMap[clubId] = {
          clubId,
          club: atleta.club || '',
          ori: 0,
          argenti: 0,
          bronzi: 0,
          punti: 0,
          atleti: {}
        };
      }
      if (!clubMap[clubId].atleti[atleta.id]) {
        clubMap[clubId].atleti[atleta.id] = {
          id: atleta.id,
          nome: atleta.nome,
          cognome: atleta.cognome,
          ori: 0,
          argenti: 0,
          bronzi: 0,
          medaglie: []
        };
      }
      if (idx === 0) {
        clubMap[clubId].ori++;
        clubMap[clubId].atleti[atleta.id].ori++;
        clubMap[clubId].atleti[atleta.id].medaglie.push('oro');
        clubMap[clubId].punti += 7;
      } else if (idx === 1) {
        clubMap[clubId].argenti++;
        clubMap[clubId].atleti[atleta.id].argenti++;
        clubMap[clubId].atleti[atleta.id].medaglie.push('argento');
        clubMap[clubId].punti += 4;
      } else if (idx >= 2) {
        clubMap[clubId].bronzi++;
        clubMap[clubId].atleti[atleta.id].bronzi++;
        clubMap[clubId].atleti[atleta.id].medaglie.push('bronzo');
        clubMap[clubId].punti += 2;
      }
    });
  });

  // Array ordinato
  const arr = Object.values(clubMap).sort((a, b) => b.ori - a.ori || b.argenti - a.argenti || b.bronzi - a.bronzi);
  return {
    podio: arr.slice(0, 3),
    classifica: arr
  };
}

function dettagliMedaglieClub(svolgimenti, clubId) {
  const clubMap = calcolaRisultatiClub(svolgimenti).classifica.find(c => String(c.clubId) === String(clubId));
  if (!clubMap) return { atleti: [] };
  return {
    atleti: Object.values(clubMap.atleti).map(a => ({ ...a }))
  };
}

module.exports = {
  calcolaRisultatiAtleti,
  calcolaRisultatiClub,
  dettagliMedaglieClub
};
