const { Competizione, Categoria, Club, ConfigTipoCategoria, ConfigTipoAtleta, ConfigTipoCompetizione } = require('../models');
const { IscrizioneClub, IscrizioneAtleta, Atleta } = require('../models');

const logger = require('../helpers/logger/logger');
const PDFDocument = require('pdfkit');

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
      attributes: { 
        // Escludiamo tutti i file BLOB per performance
        exclude: ['circolareGara', 'fileExtra1', 'fileExtra2']
      },
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logo'] }
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
      attributes: { 
        // Escludiamo tutti i file BLOB per performance
        exclude: ['circolareGara', 'fileExtra1', 'fileExtra2']
      },
      include: [
        {
          model: Categoria,
          as: 'categorie',
          include: ['atleti', 'giudici']
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logo'] }
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
      attributes: { 
        exclude: ['circolareGara', 'fileExtra1', 'fileExtra2']
      },
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logo'] }
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
      attributes: { 
        exclude: ['circolareGara', 'fileExtra1', 'fileExtra2']
      },
      include: [
        {
          model: Categoria,
          as: 'categorie'
        },
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logo'] }
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

// Upload file per una competizione
const uploadFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const competizione = await Competizione.findByPk(id);
    
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    const updateData = {};
    
    // Processa i file caricati e li converte in BLOB
    if (req.files) {
      if (req.files.circolareGara && req.files.circolareGara[0]) {
        const file = req.files.circolareGara[0];
        updateData.circolareGara = file.buffer;
        updateData.circolareGaraNome = file.originalname;
        updateData.circolareGaraTipo = file.mimetype;
      }
      if (req.files.fileExtra1 && req.files.fileExtra1[0]) {
        const file = req.files.fileExtra1[0];
        updateData.fileExtra1 = file.buffer;
        updateData.fileExtra1Nome = file.originalname;
        updateData.fileExtra1Tipo = file.mimetype;
      }
      if (req.files.fileExtra2 && req.files.fileExtra2[0]) {
        const file = req.files.fileExtra2[0];
        updateData.fileExtra2 = file.buffer;
        updateData.fileExtra2Nome = file.originalname;
        updateData.fileExtra2Tipo = file.mimetype;
      }
    }

    // Aggiorna la competizione con i file BLOB
    await Competizione.update(updateData, { where: { id } });
    
    const updatedCompetizione = await Competizione.findByPk(id, {
      attributes: { exclude: ['circolareGara', 'fileExtra1', 'fileExtra2'] } // Escludi i BLOB dalla risposta
    });
    
    res.json({
      message: 'File caricati con successo',
      competizione: updatedCompetizione
    });
  } catch (error) {
    logger.error(`Errore nel caricamento dei file per competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel caricamento dei file',
      details: error.message 
    });
  }
};

// Download file di una competizione
const downloadFile = async (req, res) => {
  try {
    const { id, fileType } = req.params;
    const competizione = await Competizione.findByPk(id);
    
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    let fileBuffer, fileName, mimeType;
    
    switch (fileType) {
      case 'circolare':
        fileBuffer = competizione.circolareGara;
        fileName = competizione.circolareGaraNome;
        mimeType = competizione.circolareGaraTipo;
        break;
      case 'extra1':
        fileBuffer = competizione.fileExtra1;
        fileName = competizione.fileExtra1Nome;
        mimeType = competizione.fileExtra1Tipo;
        break;
      case 'extra2':
        fileBuffer = competizione.fileExtra2;
        fileName = competizione.fileExtra2Nome;
        mimeType = competizione.fileExtra2Tipo;
        break;
      default:
        return res.status(400).json({ error: 'Tipo di file non valido' });
    }

    if (!fileBuffer) {
      return res.status(404).json({ error: 'File non trovato' });
    }

    // Sanitizza il filename per evitare problemi con caratteri speciali
    const sanitizedFileName = fileName ? fileName.replace(/[^\w\s.-]/gi, '') : 'download';

    res.set({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${sanitizedFileName}"`,
      'Content-Length': fileBuffer.length
    });
    
    res.send(fileBuffer);
  } catch (error) {
    logger.error(`Errore nel download del file ${req.params.fileType} per competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore nel download del file',
      details: error.message 
    });
  }
};


// Riepilogo costi dettagliato per una competizione e club
const getCompetitionCostSummary = async (req, res) => {
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

    if (iscrizioniAtleti.length === 0) {
      return res.status(404).json({ error: 'Nessuna iscrizione atleta trovata per questo club e competizione' });
    }

    // Raggruppa iscrizioni per atleta
    const iscrizioniPerAtleta = {};
    iscrizioniAtleti.forEach((iscrizione) => {
      const atleta = iscrizione.atleta;
      const tipoCategoria = iscrizione.tipoCategoria;
      if (atleta) {
        // Raggruppa per id atleta
        if (!iscrizioniPerAtleta[atleta.id]) {
          iscrizioniPerAtleta[atleta.id] = { atleta, categorie: [], costoIscrizione: iscrizione.costoIscrizione };
        }
        if (tipoCategoria && tipoCategoria.nome) {
          iscrizioniPerAtleta[atleta.id].categorie.push(tipoCategoria.nome);
          categoryBreakdown[tipoCategoria.nome] = (categoryBreakdown[tipoCategoria.nome] || 0) + 1;
        }
      }
    });

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
      athleteTypeTotals
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
            attributes: ['id', 'denominazione']
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
          let clubName = atleta.club?.denominazione || '-';
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

module.exports = {
  getAllCompetizioni,
  getTipoCategorieByCompetizione,
  getCompetizioneById,
  createCompetizione,
  updateCompetizione,
  deleteCompetizione,
  getCompetizioniByStato,
  getCompetizioniByTipologia,
  uploadFiles,
  downloadFile,
  deleteFile,
  getCompetitionCostSummary,
  printCategories
};
