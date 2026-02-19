// Controller per risultati generali (atleti e club)
const { SvolgimentoCategoria, Categoria, Atleta, Club, Competizione } = require('../models');
const { Op } = require('sequelize');
const { buildGlobalAthleteList, buildClubRanking, computeAthletePoints, assignAgeGroupAndTipo, bestAthletesByTipoFascia } = require('../utils/resultsHelpers');
const PDFDocument = require('pdfkit');

// GET /results/atleti
async function getAtletiResults(req, res) {
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
async function getClubResults(req, res) {
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
async function getClubMedalsDetails(req, res) {
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

// Utility per generare il PDF delle classifiche finali
async function printResults(req, res) {
  const { competizioneId } = req.params;
  try {
    // Recupera tutte le categorie della competizione
    const categorie = await Categoria.findAll({
      where: { competizioneId },
      order: [['nome', 'ASC']]
    });

    // Recupera i dati di svolgimento per tutte le categorie (senza include)
    const svolgimenti = await SvolgimentoCategoria.findAll({
      where: { categoriaId: { [Op.in]: categorie.map(c => c.id) } }
    });

    // Mappa categoriaId -> svolgimento
    const svolgimentoMap = {};
    svolgimenti.forEach(s => {
      svolgimentoMap[s.categoriaId] = s;
    });

    // Prepara il PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="classifiche-${competizioneId}.pdf"`);
      res.send(pdfData);
    });

    // Header
    const competizione = await Competizione.findByPk(competizioneId);
    doc.fontSize(20).text('CLASSIFICHE FINALI', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`${competizione.nome} - ${competizione.luogo}`, { align: 'center' });
    doc.moveDown(1);

    // Per ogni categoria
    for (const categoria of categorie) {
      // Se manca spazio sulla pagina, vai a nuova pagina
      if (doc.y > 700) doc.addPage();
      // Titolo categoria sempre allineato a sinistra
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1976d2').text(`${categoria.nome}`, 40, doc.y, { underline: true });
      doc.moveDown(0.2);
      const svolgimento = svolgimentoMap[categoria.id];
      let classifica = [];
      if (svolgimento && svolgimento.classifica) {
        classifica = svolgimento.classifica;
      }
      if (classifica.length === 0) {
        doc.fontSize(10).font('Helvetica').text('Nessun atleta in classifica', 40, doc.y, { color: '#999999', italics: true });
        doc.moveDown(1);
        continue;
      }
      // Recupera info atleti in classifica
      const atletiIds = classifica.map(c => c.atletaId);
      const atleti = await Atleta.findAll({
        where: { id: { [Op.in]: atletiIds } },
        include: [{ model: Club, as: 'club' }]
      });
      const atletaMap = {};
      atleti.forEach(a => { atletaMap[a.id] = a; });
      // Layout tabella
      const col1 = 60;  // Progressivo
      const col2 = 110;  // Cognome
      const col3 = 230;  // Nome
      const col4 = 350;  // Club
      const rowHeight = 14;
      const cellPadding = 2;
      // Header
      let tableY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.fillColor('#f0f0f0').rect(40, tableY, 515, rowHeight).fill();
      doc.fillColor('black');
      doc.text('#', col1, tableY + cellPadding);
      doc.text('Cognome', col2, tableY + cellPadding);
      doc.text('Nome', col3, tableY + cellPadding);
      doc.text('Club', col4, tableY + cellPadding);
      let currentY = tableY + rowHeight + 2;
      doc.fontSize(10).font('Helvetica');
      for (let idx = 0; idx < classifica.length; idx++) {
        const c = classifica[idx];
        const atleta = atletaMap[c.atletaId];
        if (!atleta) continue;
        // Se manca spazio sulla pagina, vai a nuova pagina e riscrivi header
        if (currentY > 750) {
          doc.addPage();
          tableY = doc.y;
          doc.fontSize(10).font('Helvetica-Bold');
          doc.fillColor('#f0f0f0').rect(40, tableY, 515, rowHeight).fill();
          doc.fillColor('black');
          doc.text('#', col1, tableY + cellPadding);
          doc.text('Cognome', col2, tableY + cellPadding);
          doc.text('Nome', col3, tableY + cellPadding);
          doc.text('Club', col4, tableY + cellPadding);
          currentY = tableY + rowHeight + 2;
          doc.fontSize(10).font('Helvetica');
        }
        // Club - tronca se troppo lungo
        let clubName = atleta.club?.abbreviazione || atleta.club?.nome || atleta.club?.denominazione || '-';
        let clubLine2 = '';
        const maxClubLength = 40;
        if (clubName.length > maxClubLength) {
          const lastSpace = clubName.substring(0, maxClubLength).lastIndexOf(' ');
          if (lastSpace > 0) {
            clubLine2 = clubName.substring(lastSpace + 1);
            clubName = clubName.substring(0, lastSpace);
          } else {
            clubLine2 = clubName.substring(maxClubLength);
            clubName = clubName.substring(0, maxClubLength);
          }
        }
        doc.fontSize(10).font('Helvetica');
        doc.text(c.posizione || idx + 1, col1, currentY);
        doc.text(atleta.cognome || '-', col2, currentY);
        doc.text(atleta.nome || '-', col3, currentY);
        doc.text(clubName, col4, currentY);
        if (clubLine2) {
          currentY += rowHeight;
          doc.text(clubLine2, col4, currentY);
        }
        currentY += rowHeight;
      }
      // Linea separatrice dopo la tabella
      doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(40, currentY + 5).lineTo(555, currentY + 2).stroke();
      doc.y = currentY + 15;
    }
    doc.end();
  } catch (err) {
    console.error('Errore generazione PDF classifiche:', err);
    res.status(500).json({ error: 'Errore generazione PDF classifiche' });
  }
}

// PDF classifica club per una competizione
async function printClubResults(req, res) {
  const { competizioneId } = req.params;
  try {
    // Recupera la competizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    // Calcola la classifica club (usando resultsHelpers)
    const { buildClubRanking, computeAthletePoints, buildGlobalAthleteList } = require('../utils/resultsHelpers');
    const categorie = await Categoria.findAll({ where: { competizioneId } });
    const svolgimenti = await SvolgimentoCategoria.findAll({ where: { categoriaId: categorie.map(c => c.id) } });
    // Ottieni lista atleti con medaglie
    const athleteMedals = await buildGlobalAthleteList(svolgimenti);
    const athleteMedalsWithPoints = computeAthletePoints(athleteMedals);
    // Calcola classifica club
    let classifica = await buildClubRanking(athleteMedalsWithPoints);
    // Calcola punti per ogni club
    classifica = classifica.map(club => {
      // Somma i punti degli atleti del club
      const punti = (club.dettagli || []).reduce((acc, a) => acc + (a.punti || 0), 0);
      return { ...club, punti };
    });
    // Ordina per ori, argenti, bronzi, punti
    classifica.sort((a, b) => b.oro - a.oro || b.argento - a.argento || b.bronzo - a.bronzo || b.punti - a.punti);

    // Prepara il PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="classifica-club-${competizioneId}.pdf"`);
      res.send(pdfData);
    });

    // Header
    doc.fontSize(20).text('CLASSIFICA CLUB', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`${competizione.nome} - ${competizione.luogo}`, { align: 'center' });
    doc.moveDown(1);

    // Podio
    doc.fontSize(13).font('Helvetica-Bold').text('Podio', 40, doc.y);
    doc.moveDown(0.2);
    const podio = classifica.slice(0, 3);
    podio.forEach((club, idx) => {
      const ori = club.oro ?? 0;
      const argenti = club.argento ?? 0;
      const bronzi = club.bronzo ?? 0;
      doc.fontSize(12).font('Helvetica-Bold').text(`${idx + 1}. ${club.club}`, 60, doc.y, { continued: true });
      doc.fontSize(12).font('Helvetica').text(`   Ori ${ori} Argenti ${argenti} Bronzi ${bronzi}`);
    });
    doc.moveDown(1);

    // Tabella classifica completa
    doc.fontSize(13).font('Helvetica-Bold').text('Classifica completa', 40, doc.y);
    doc.moveDown(0.2);
    // Header tabella
    const col1 = 50, col2 = 80, col3 = 400, col4 = 450, col5 = 500;
    const rowHeight = 14;
    const cellPadding = 2;
    let tableY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.fillColor('#f0f0f0').rect(40, tableY, 515, rowHeight).fill();
    doc.fillColor('black');
    doc.text('#', col1, tableY + cellPadding);
    doc.text('Club', col2, tableY + cellPadding);
    doc.text('Ori', col3, tableY + cellPadding);
    doc.text('Argenti', col4, tableY + cellPadding);
    doc.text('Bronzi', col5, tableY + cellPadding);
    let currentY = tableY + rowHeight + 2;
    doc.fontSize(10).font('Helvetica');
    classifica.forEach((club, idx) => {
      if (currentY > 750) {
        doc.addPage();
        tableY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.fillColor('#f0f0f0').rect(40, tableY, 515, rowHeight).fill();
        doc.fillColor('black');
        doc.text('#', col1, tableY + cellPadding);
        doc.text('Club', col2, tableY + cellPadding);
        doc.text('Ori', col3, tableY + cellPadding);
        doc.text('Argenti', col4, tableY + cellPadding);
        doc.text('Bronzi', col5, tableY + cellPadding);
        currentY = tableY + rowHeight + 2;
        doc.fontSize(10).font('Helvetica');
      }
      const ori = club.oro ?? 0;
      const argenti = club.argento ?? 0;
      const bronzi = club.bronzo ?? 0;
      const punti = club.punti ?? 0;
      doc.text(idx + 1, col1, currentY);
      doc.text(club.club, col2, currentY, { width: col3 - col2 - 5, ellipsis: true });
      doc.text(ori, col3, currentY);
      doc.text(argenti, col4, currentY);
      doc.text(bronzi, col5, currentY);
      currentY += rowHeight;
    });
    doc.end();
  } catch (err) {
    console.error('Errore generazione PDF classifica club:', err);
    res.status(500).json({ error: 'Errore generazione PDF classifica club' });
  }
}

module.exports.printClubResults = printClubResults;

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
    const competizioneFine = await Competizione.findByPk(competitionId);
    // lista con medaglie
    let lista = await buildGlobalAthleteList(svolgimenti);

    // punti
    lista = computeAthletePoints(lista);

    // aggiungo tipo e fascia
    lista = await assignAgeGroupAndTipo(lista, competizioneFine);

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
module.exports = {
  getAtletiResults,
  getClubResults,
  getClubMedalsDetails,
  printResults,
  printClubResults
};