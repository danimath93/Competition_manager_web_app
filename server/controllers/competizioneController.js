const { Competizione, Categoria, Club, ConfigTipoCategoria, ConfigTipoAtleta, ConfigTipoCompetizione, Documento, ConfigGruppoEta } = require('../models');
const { IscrizioneClub, IscrizioneAtleta, Atleta, DettaglioIscrizioneAtleta } = require('../models');

const logger = require('../helpers/logger/logger');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const FIGHTING_COMPETITION_TYPE_ID = 3; // ID del tipo di competizione per combattimento  
const COMPLEMENTARY_ACTIVITIES_TYPE_ID = 4; // ID del tipo di competizione per attività complementari

// Ottieni tutte le competizioni
const getAllCompetizioni = async (req, res) => {
  try {
    const { stati } = req.query;
    const whereClause = {};
    
    // Se sono specificati stati, filtra per quegli stati
    if (stati) {
      const statiArray = Array.isArray(stati) ? stati : [stati];
      whereClause.stato = statiArray;
    }
    
    const competizioni = await Competizione.findAll({
      where: whereClause,
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logoId'] }
        },
        {
          model: Documento,
          as: 'circolareGaraDocumento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'locandinaDocumento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'fileExtra1Documento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'fileExtra2Documento',
          attributes: { exclude: ['file'] }
        }
      ],
      order: [['dataInizio', 'DESC']]
    });

    res.json(competizioni);
  } catch (error) {
    logger.error(`Errore nel recupero delle competizioni: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni',
      details: error.message 
    });
  }
};

// Ottieni le categorie di una competizione specifica
const getTipoCategorieByCompetizione = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const competition = await Competizione.findByPk(competizioneId);
    if (!competition) {
      logger.warn(`Tentativo recupero categorie per competizione inesistente - ID: ${competizioneId}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // TODO: Da rimuovere in futuro: supporto legacy per tipologie di competizione salvate come array di interi

  } catch (error) {
    logger.error(`Errore nel recupero delle categorie per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero delle categorie',
      details: error.message 
    });
  }
};

// Ottieni una competizione per ID
const getCompetizioneById = async (req, res) => {
  try {
    const { id } = req.params;
    const competizione = await Competizione.findByPk(id, {
      include: [
        {
          model: Categoria,
          as: 'categorie',
          include: ['atleti']
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logoId'] }
        },
        {
          model: Documento,
          as: 'circolareGaraDocumento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'locandinaDocumento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'fileExtra1Documento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'fileExtra2Documento',
          attributes: { exclude: ['file'] }
        }
      ]
    });
    
    if (!competizione) {
      logger.warn(`Tentativo recupero competizione inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    res.json(competizione);
  } catch (error) {
    logger.error(`Errore nel recupero della competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero della competizione',
      details: error.message 
    });
  }
};

// Crea una nuova competizione
const createCompetizione = async (req, res) => {
  try {
    const competizione =  await Competizione.create(req.body);
    logger.info(`Competizione creata - ID: ${competizione.id}, Nome: ${competizione.nome}`);
    res.status(201).json(competizione);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nella creazione competizione: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nella creazione della competizione: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nella creazione della competizione',
      details: error.message 
    });
  }
};

// Aggiorna una competizione
const updateCompetizione = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Competizione.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      logger.warn(`Tentativo aggiornamento competizione inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    const updatedCompetizione = await Competizione.findByPk(id);
    logger.info(`Competizione aggiornata - ID: ${id}`);
    res.json(updatedCompetizione);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nell'aggiornamento competizione ${req.params.id}: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nell'aggiornamento della competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'aggiornamento della competizione',
      details: error.message 
    });
  }
};

// Elimina una competizione
const deleteCompetizione = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Competizione.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      logger.warn(`Tentativo eliminazione competizione inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    logger.info(`Competizione eliminata - ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Errore nell'eliminazione della competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione della competizione',
      details: error.message 
    });
  }
};

// Ottieni competizioni per stato
const getCompetizioniByStato = async (req, res) => {
  try {
    const { stato } = req.params;
    const competizioni = await Competizione.findAll({
      where: { stato },
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logoId'] }
        },
        {
          model: Documento,
          as: 'circolareGaraDocumento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'locandinaDocumento',
          attributes: { exclude: ['file'] }
        }
      ],
      order: [['dataInizio', 'ASC']]
    });

    res.json(competizioni);
  } catch (error) {
    logger.error(`Errore nel recupero delle competizioni per stato ${req.params.stato}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni',
      details: error.message 
    });
  }
};

// Ottieni competizioni per tipologia
const getCompetizioniByTipologia = async (req, res) => {
  try {
    const { tipologiaId } = req.params;
    const tipologiaIdInt = parseInt(tipologiaId);
    
    if (isNaN(tipologiaIdInt)) {
      return res.status(400).json({ error: 'ID tipologia non valido' });
    }

    // Verifica che la tipologia esista
    const tipologiaEsiste = await ConfigTipoCompetizione.findByPk(tipologiaIdInt);
    if (!tipologiaEsiste) {
      return res.status(404).json({ error: 'Tipologia non trovata' });
    }

    const competizioni = await Competizione.findAll({
      where: {
        tipologia: {
          [require('sequelize').Op.contains]: [tipologiaIdInt]
        }
      },
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logoId'] }
        },
        {
          model: Documento,
          as: 'circolareGaraDocumento',
          attributes: { exclude: ['file'] }
        },
        {
          model: Documento,
          as: 'locandinaDocumento',
          attributes: { exclude: ['file'] }
        }
      ],
      order: [['dataInizio', 'DESC']]
    });

    res.json(competizioni);
  } catch (error) {
    logger.error(`Errore nel recupero delle competizioni per tipologia ${req.params.tipologiaId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni per tipologia',
      details: error.message 
    });
  }
};

// Riepilogo costi dettagliato per una competizione e club
const getCompetitionClubRegistrationSummary = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const { clubId } = req.query;
    if (!clubId) {
      return res.status(400).json({ error: 'clubId mancante' });
    }

    if (!competizioneId) {
      return res.status(400).json({ error: 'competizioneId mancante' });
    }

    // Trova la competizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // Trova gli atleti iscritti del club alla competizione, includendo la categoria
    const iscrizioniAtleti = await IscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          where: { clubId },
          required: true,
          include: [{ model: ConfigTipoAtleta, as: 'tipoAtleta' }]
        },
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria'
        }
      ],
    });

    // Calcola dettagli per tipo atleta
    const athleteTypeTotals = {};
    const categoryBreakdown = {};
    const categoryTypeTotals = {};

    if (iscrizioniAtleti.length === 0) {
      return res.status(404).json({ error: 'Nessuna iscrizione atleta trovata per questo club e competizione' });
    }

    // Raggruppa iscrizioni per atleta
    const iscrizioniPerAtleta = {};
    for (const iscrizione of iscrizioniAtleti) {
      const atleta = iscrizione.atleta;
      const tipoCategoria = iscrizione.tipoCategoria;
      if (atleta) {
        // Raggruppa per id atleta
        if (!iscrizioniPerAtleta[atleta.id]) {
          iscrizioniPerAtleta[atleta.id] = { atleta, categorie: [], costoIscrizione: 0 };
          // Uso i dettagli iscrizione per calcolare il costo
          const dettagliIscrizione = await DettaglioIscrizioneAtleta.findOne({
            where: {
              atletaId: atleta.id,
              competizioneId: competizioneId
            }
          });

          if (dettagliIscrizione && dettagliIscrizione.quota > 0) {
            iscrizioniPerAtleta[atleta.id].costoIscrizione = parseFloat(dettagliIscrizione.quota);
          }
        }
        if (tipoCategoria && tipoCategoria.nome) {
          iscrizioniPerAtleta[atleta.id].categorie.push(tipoCategoria.nome);
          categoryBreakdown[tipoCategoria.nome] = (categoryBreakdown[tipoCategoria.nome] || 0) + 1;
          categoryTypeTotals[tipoCategoria.tipoCompetizioneId] = (categoryTypeTotals[tipoCategoria.tipoCompetizioneId] || 0) + 1;
        }
      }
    };

    // Calcola breakdown per tipo atleta e iscrizioni singole/multiple
    Object.values(iscrizioniPerAtleta).forEach(({ atleta, categorie, costoIscrizione }) => {
      // Tipo atleta: mostra nome invece di id
      let tipo = atleta.tipoAtleta && atleta.tipoAtleta.nome ? atleta.tipoAtleta.nome : 'Altro';
      if (!athleteTypeTotals[tipo]) {
        athleteTypeTotals[tipo] = { total: 0, singleCategory: 0, multiCategory: 0 };
      }
      athleteTypeTotals[tipo].total++;
      if (categorie.length === 1) athleteTypeTotals[tipo].singleCategory++;
      if (categorie.length > 1) athleteTypeTotals[tipo].multiCategory++;
      if (costoIscrizione > 0) athleteTypeTotals[tipo].totalCost = (athleteTypeTotals[tipo].totalCost || 0) + parseFloat(costoIscrizione);
    });

    // Totali
    const totalAthletes = Object.keys(iscrizioniPerAtleta).length;
    const totalCategories = Object.values(categoryBreakdown).reduce((acc, v) => acc + v, 0);
    const totalCost = Object.values(iscrizioniPerAtleta).reduce((acc, iscrizione) => acc + parseFloat(iscrizione.costoIscrizione || 0), 0); 

    // IBAN, intestatario, causale
    const iban = competizione.iban || null;
    const intestatario = competizione.intestatario || null;
    const causale = competizione.causale || null;

    const summary = {
      versamento: {
        iban,
        intestatario,
        causale
      }, 
      totals: {
        totalAthletes,
        totalCategories,
        totalCost
      },
      athleteTypeTotals,
      categoryTypeTotals
    };
    res.json(summary);
  } catch (error) {
    logger.error(`Errore nel riepilogo costi per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Errore nel riepilogo costi', details: error.message });
  }
};

// Elimina file di una competizione
const deleteFile = async (req, res) => {
  try {
    const { id, fileType } = req.params;
    const competizione = await Competizione.findByPk(id);
    
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    const updateData = {};
    
    switch (fileType) {
      case 'circolare':
        if (!competizione.circolareGara) {
          return res.status(404).json({ error: 'File non trovato' });
        }
        updateData.circolareGara = null;
        updateData.circolareGaraNome = null;
        updateData.circolareGaraTipo = null;
        break;
      case 'extra1':
        if (!competizione.fileExtra1) {
          return res.status(404).json({ error: 'File non trovato' });
        }
        updateData.fileExtra1 = null;
        updateData.fileExtra1Nome = null;
        updateData.fileExtra1Tipo = null;
        break;
      case 'extra2':
        if (!competizione.fileExtra2) {
          return res.status(404).json({ error: 'File non trovato' });
        }
        updateData.fileExtra2 = null;
        updateData.fileExtra2Nome = null;
        updateData.fileExtra2Tipo = null;
        break;
      default:
        return res.status(400).json({ error: 'Tipo di file non valido' });
    }

    // Aggiorna il database
    await Competizione.update(updateData, { where: { id } });
    
    logger.info(`File ${fileType} eliminato per competizione ${id}`);
    res.json({ message: 'File eliminato con successo' });
  } catch (error) {
    logger.error(`Errore nell'eliminazione del file ${req.params.fileType} per competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione del file',
      details: error.message 
    });
  }
};

// Stampa categorie in PDF
const printCategories = async (req, res) => {
  try {
    const { competizioneId } = req.params;

    // Recupera la competizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      logger.warn(`Tentativo stampa categorie per competizione inesistente - ID: ${competizioneId}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // Recupera tutte le categorie con gli atleti iscritti
    const categorie = await Categoria.findAll({
      where: { competizioneId },
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          attributes: ['id', 'nome'],
          include: [{
            model: ConfigTipoCompetizione,
            as: 'tipoCompetizione',
            attributes: ['id', 'nome']
          }]
        }
      ],
      order: [['nome', 'ASC']]
    });

    // Ordina le categorie in modo intelligente considerando i numeri
    categorie.sort((a, b) => {
      return a.nome.localeCompare(b.nome, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    // Per ogni categoria, recupera gli atleti
    let totalAthletes = 0;
    for (const categoria of categorie) {
      const iscrizioni = await IscrizioneAtleta.findAll({
        where: { categoriaId: categoria.id },
        attributes: ['id', 'atletaId', 'peso'],
        include: [{
          model: Atleta,
          as: 'atleta',
          attributes: ['id', 'nome', 'cognome', 'dataNascita'],
          include: [{
            model: Club,
            as: 'club',
            attributes: ['id', 'denominazione', 'abbreviazione']
          }]
        }],
        order: [['atleta', 'cognome', 'ASC']]
      });
      categoria.dataValues.iscrizioni = iscrizioni;
      totalAthletes += iscrizioni.length;
    }

    // Crea il PDF
    const doc = new PDFDocument({
      bufferPages: true,
      margin: 40,
      size: 'A4'
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="categorie-${competizione.nome.replace(/\s+/g, '_')}.pdf"`);

    // Pipe to response
    doc.pipe(res);

    // Titolo
    doc.fontSize(20).font('Helvetica-Bold').text('CATEGORIE COMPETIZIONE', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(competizione.nome, { align: 'center' });
    doc.moveDown(0.5);

    // Sezione riepilogo
    doc.fontSize(11).font('Helvetica-Bold').text('RIEPILOGO GENERALE:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome Competizione: ${competizione.nome}`);
    doc.text(`Totale Categorie: ${categorie.length}`);
    doc.text(`Totale Iscritti: ${totalAthletes}`);
    doc.moveDown(1);

    // Linea separatrice
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Per ogni categoria, crea una sezione
    categorie.forEach((categoria, categoryIndex) => {
      const iscrizioni = categoria.dataValues.iscrizioni || [];

      // Verifica se abbiamo spazio sulla pagina, altrimenti crea una nuova pagina
      if (doc.y > 700) {
        doc.addPage();
      }

      // Titolo categoria
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1976d2');
      doc.text(`${categoria.nome} (${iscrizioni.length} atleti)`, 40, doc.y, {
        underline: true,
        width: 515,
        align: 'left'
      });
      doc.fillColor('black');
      doc.moveDown(0.2);

      // Tabella atleti
      if (iscrizioni.length === 0) {
        doc.fontSize(10).font('Helvetica').text('Nessun atleta iscritto', { color: '#999999', italics: true });
      } else {
        // Intestazione tabella
        const tableTop = doc.y;
        const col1 = 50;  // Progressivo
        const col2 = 70;  // Cognome
        const col3 = 150;  // Nome
        const col4 = 250;  // Club
        const col5 = 490;  // Nascita / Peso
        const rowHeight = 14;
        const cellPadding = 2;

        // Header
        doc.fontSize(9).font('Helvetica-Bold');
        doc.fillColor('#f0f0f0').rect(40, tableTop, 515, rowHeight).fill();
        doc.fillColor('black');
        
        doc.text('#', col1, tableTop + cellPadding);
        doc.text('Cognome', col2, tableTop + cellPadding);
        doc.text('Nome', col3, tableTop + cellPadding);
        doc.text('Club', col4, tableTop + cellPadding);
        doc.text('Nascita / Peso', col5, tableTop + cellPadding);

        let currentY = tableTop + rowHeight + 8;

        // Righe atleti
        doc.fontSize(9).font('Helvetica');
        iscrizioni.forEach((iscrizione, athleteIndex) => {
          const atleta = iscrizione.atleta;
          if (!atleta) return;

          // Controlla lo spazio sulla pagina
          if (currentY > 750) {
            doc.addPage();
            currentY = 60;
          }

          // Calcola l'anno di nascita
          const birthDate = new Date(atleta.dataNascita);
          const birthYear = birthDate.getFullYear();
          
          // Peso
          const peso = iscrizione.peso ? `${iscrizione.peso} kg` : '-';
          
          // Club - tronca se troppo lungo
          let clubName = atleta.club?.abbreviazione || atleta.club?.denominazione || '-';
          let clubLine2 = '';
          const maxClubLength = 55;
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
          
          // Disegna la riga
          doc.text(athleteIndex + 1, col1, currentY);
          doc.text(atleta.cognome || '-', col2, currentY);
          doc.text(atleta.nome || '-', col3, currentY);
          doc.text(clubName, col4, currentY);
          doc.text(`${birthYear} / ${peso}`, col5, currentY);

          // Se il club ha una seconda riga, disegnala
          if (clubLine2) {
            currentY += rowHeight;
            if (currentY > 750) {
              doc.addPage();
              currentY = 60;
            }
            doc.text(clubLine2, col4, currentY);
          }

          currentY += rowHeight;
        });

        // Linea separatrice dopo la tabella
        doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(40, currentY + 5).lineTo(555, currentY + 2).stroke();
        doc.y = currentY + 15;
      }

      doc.moveDown(0.5);
    });

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#999999');
    doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')} - ${new Date().toLocaleTimeString('it-IT')}`, {
      align: 'center'
    });

    // Finalize PDF
    doc.end();

    logger.info(`PDF categorie generato per competizione ${competizioneId}`);
  } catch (error) {
    logger.error(`Errore nella generazione del PDF categorie per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nella generazione del PDF',
      details: error.message 
    });
  }
};

const exportCategories = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    // Recupera la competizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      logger.warn(`Tentativo esportazione categorie per competizione inesistente - ID: ${competizioneId}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // Recupera tutte le categorie con i tipi di categoria
    const categorie = await Categoria.findAll({
      where: { competizioneId },
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          attributes: ['id', 'nome'],
          include: [{
            model: ConfigTipoCompetizione,
            as: 'tipoCompetizione',
            attributes: ['id', 'nome']
          }]
        }
      ],
      order: [['nome', 'ASC']]
    });
 
    const gruppiEta = await ConfigGruppoEta.findAll({
      attributes: ['id', 'nome']
    });

    // Crea il workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categorie');
    // Definisci le colonne
    worksheet.columns = [
      { header: 'ID Categoria', key: 'id', width: 15 },
      { header: 'Categoria', key: 'nome', width: 30 },
      { header: 'Tipo Categoria', key: 'tipoCategoriaNome', width: 30 },
      { header: 'Tipo Competizione', key: 'tipoCompetizioneNome', width: 30 },
      { header: 'Gruppo Età', key: 'gruppoEtaNome', width: 20 },
      { header: 'Ori', key: 'ori', width: 10 },
      { header: 'Argenti', key: 'argenti', width: 10 },
      { header: 'Bronzi', key: 'bronzi', width: 10 }
    ];

    // Aggiungi i dati delle categorie
    categorie.forEach(categoria => {
      let gruppoEtaList = [];
      if (categoria.gruppiEtaId && categoria.gruppiEtaId.length > 0) {
        // Per ognni id del gruppo età associato alla categoria, trova il nome corrispondente
        gruppoEtaList = gruppiEta.filter(ge => categoria.gruppiEtaId.includes(ge.id)).map(ge => ge.nome);
      }
      let countOro = categoria.maxPartecipanti && categoria.maxPartecipanti > 0 ? 1 : 0;
      let countArgento = categoria.maxPartecipanti && categoria.maxPartecipanti > 1 ? 1 : 0;
      let countBronzo = categoria.maxPartecipanti && categoria.maxPartecipanti > 2 ? 1 : 0;
      if (categoria.tipoCategoria && categoria.tipoCategoria.tipoCompetizione) {
        // Per competizioni di combattimento, assegna 2 bronzi se ci sono più di 4 partecipanti
        if (categoria.tipoCategoria.tipoCompetizione.id === FIGHTING_COMPETITION_TYPE_ID) {
          countBronzo = categoria.maxPartecipanti && categoria.maxPartecipanti > 4 ? 2 : countBronzo;
        }
        // Per competizioni di attività complementari, nessuna medaglia
        if (categoria.tipoCategoria.tipoCompetizione.id === COMPLEMENTARY_ACTIVITIES_TYPE_ID) {
          countOro = 0;
          countArgento = 0;
          countBronzo = 0;
        }
      }

      worksheet.addRow({  
        id: categoria.id,
        nome: categoria.nome,
        tipoCategoriaNome: categoria.tipoCategoria ? categoria.tipoCategoria.nome : '-',
        tipoCompetizioneNome: categoria.tipoCategoria && categoria.tipoCategoria.tipoCompetizione ? categoria.tipoCategoria.tipoCompetizione.nome : '-',
        gruppoEtaNome: gruppoEtaList.length > 0 ? gruppoEtaList.join(', ') : '-',
        ori: countOro,
        argenti: countArgento,
        bronzi: countBronzo
      });
    });

    // Finalize Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', `attachment; filename="categorie_${competizione?.nome}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    logger.error(`Errore nell'esportazione delle categorie per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nell\'esportazione delle categorie',
      details: error.message
    });
  }
};

const exportRegisteredAthletes = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const { mode = 'simple' } = req.query;
    if (!competizioneId) {
      return res.status(400).json({ error: 'competizioneId mancante' });
    }

    // Recupera la competizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      logger.warn(`Tentativo esportazione atleti per competizione inesistente - ID: ${competizioneId}`);
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // Recupera tutti gli atleti iscritti tramite DettaglioIscrizioneAtleta
    const dettagliIscrizioni = await DettaglioIscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          attributes: ['id', 'nome', 'cognome', 'numeroTessera', 'dataNascita', 'sesso', 'scadenzaCertificato'],
          include: [
            {
              model: Club,
              as: 'club',
              attributes: ['denominazione', 'tesseramento']
            },
            {
              model: ConfigTipoAtleta,
              as: 'tipoAtleta',
              attributes: ['nome']
            }
          ]
        }
      ],
      order: [['atleta', 'numeroTessera', 'ASC'], ['atleta', 'cognome', 'ASC'], ['atleta', 'nome', 'ASC']]
    });

    if (dettagliIscrizioni.length === 0) {
      logger.warn(`Nessun atleta iscritto per competizione ${competizioneId}`);
      return res.status(404).json({ error: 'Nessun atleta iscritto a questa competizione' });
    }

    // Variabili per dati aggiuntivi in modalità full
    let categorieUniche = [];
    let iscrizioniPerAtleta = {};
    let atletiDaEsportare = dettagliIscrizioni.map(d => d.atleta).filter(a => a);

    if (mode === 'full') {
      // Modalità full: carica categorie e iscrizioni
      const categorie = await Categoria.findAll({
        where: { competizioneId },
        attributes: ['id'],
        include: [
          {
            model: ConfigTipoCategoria,
            as: 'tipoCategoria',
            attributes: ['id', 'nome']
          }
        ],
        order: [['nome', 'ASC']]
      });

      // Crea una mappa delle tipologie di categoria uniche
      const categorieMap = new Map();
      categorie.forEach(cat => {
        if (cat.tipoCategoria) {
          categorieMap.set(cat.tipoCategoria.id, cat.tipoCategoria.nome);
        }
      });
      categorieUniche = Array.from(categorieMap.entries()).map(([id, nome]) => ({ id, nome }));

      // Recupera tutte le iscrizioni degli atleti alle categorie
      const iscrizioniAtleti = await IscrizioneAtleta.findAll({
        where: { competizioneId },
        include: [
          {
            model: ConfigTipoCategoria,
            as: 'tipoCategoria',
            attributes: ['id', 'nome']
          },
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nome']
          }
        ]
      });

      // Raggruppa le iscrizioni per atleta
      for (const iscrizione of iscrizioniAtleti) {
        if (!iscrizioniPerAtleta[iscrizione.atletaId]) {
          iscrizioniPerAtleta[iscrizione.atletaId] = [];
        }
        iscrizioniPerAtleta[iscrizione.atletaId].push({
          tipoCategoriaId: iscrizione.tipoCategoriaId,
          tipoCategoriaNome: iscrizione.tipoCategoria?.nome,
          categoriaId: iscrizione.categoriaId,
          categoriaNome: iscrizione.categoria?.nome,
          peso: iscrizione.peso,
          dettagli: iscrizione.dettagli
        });
      }
    }

    // Crea il workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Atleti Iscritti');

    // Definisci le colonne base in base alla modalità
    const columns = mode === 'full' ? [
      { header: 'N. Tessera', key: 'tessera', width: 20 },
      { header: 'Club', key: 'club', width: 30 },
      { header: 'Atleta', key: 'atleta', width: 30 },
      { header: 'Data di Nascita', key: 'dataNascita', width: 15 },
      { header: 'Tipo Atleta', key: 'tipoAtleta', width: 15 },
      { header: 'Sesso', key: 'sesso', width: 10 },
      { header: 'Certificato', key: 'certificato', width: 15 },
      { header: 'Tesseramento', key: 'tesseramento', width: 15 }
    ] : [
      { header: 'N. Tessera', key: 'tessera', width: 20 },
      { header: 'Nome', key: 'nome', width: 25 },
      { header: 'Cognome', key: 'cognome', width: 25 },
      { header: 'Club', key: 'club', width: 40 }
    ];

    // Aggiungi colonne per le categorie in modalità full
    if (mode === 'full') {
      categorieUniche.forEach(cat => {
        columns.push({
          header: cat.nome,
          key: `cat_${cat.id}`,
          width: 20
        });
      });
    }

    worksheet.columns = columns;

    // Formattazione intestazione
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Aggiungi i dati degli atleti
    atletiDaEsportare.forEach((atleta) => {
      const rowData = mode === 'full' ? {
        tessera: atleta.numeroTessera || 'N/A',
        club: atleta.club?.denominazione || 'N/A',
        atleta: `${atleta.cognome} ${atleta.nome}`,
        dataNascita: atleta.dataNascita ? new Date(atleta.dataNascita).toLocaleDateString('it-IT') : 'N/A',
        tipoAtleta: atleta.tipoAtleta?.nome || 'N/A',
        sesso: atleta.sesso || 'N/A',
        certificato: atleta.scadenzaCertificato ? new Date(atleta.scadenzaCertificato).toLocaleDateString('it-IT') : 'N/A',
        tesseramento: atleta.club?.tesseramento || 'N/A'
      } : {
        tessera: atleta.numeroTessera || '',
        nome: atleta.nome || '',
        cognome: atleta.cognome || '',
        club: atleta.club?.denominazione || ''
      };

      // Aggiungi i dati delle categorie solo in modalità full
      if (mode === 'full') {
        const iscrizioniAtleta = iscrizioniPerAtleta[atleta.id] || [];
        categorieUniche.forEach(cat => {
          const iscrizione = iscrizioniAtleta.find(i => i.tipoCategoriaId === cat.id);
          if (iscrizione) {
            if (iscrizione.dettagli?.nome) {
              rowData[`cat_${cat.id}`] = iscrizione.dettagli.nome;
            } else if (iscrizione.peso) {
              rowData[`cat_${cat.id}`] = `${iscrizione.peso} kg`;
            } else {
              rowData[`cat_${cat.id}`] = 'Iscritto';
            }
          } else {
            rowData[`cat_${cat.id}`] = '-';
          }
        });
      }

      worksheet.addRow(rowData);
    });

    // Formattazione delle celle dati
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Salta l'intestazione
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      }
    });

    // Imposta le intestazioni della risposta
    const fileName = `atleti-iscritti-${competizione.nome.replace(/\s+/g, '_')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Invia il file
    await workbook.xlsx.write(res);
    
    logger.info(`File Excel atleti iscritti generato per competizione ${competizioneId} - ${atletiDaEsportare.length} atleti`);
    res.end();
  } catch (error) {
    logger.error(`Errore nella generazione del file Excel atleti iscritti per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nella generazione del file Excel',
      details: error.message 
    });
  }
};

module.exports = {
  getAllCompetizioni,
  getTipoCategorieByCompetizione,
  getCompetizioneById,
  createCompetizione,
  updateCompetizione,
  deleteCompetizione,
  getCompetizioniByStato,
  getCompetizioniByTipologia,
  getCompetitionClubRegistrationSummary,
  printCategories,
  exportCategories,
  exportRegisteredAthletes
};
