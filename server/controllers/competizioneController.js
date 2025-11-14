const { Competizione, Categoria, Club, ConfigTipoCategoria, ConfigTipoCompetizione } = require('../models');
const logger = require('../helpers/logger/logger');

// Ottieni tutte le competizioni
const getAllCompetizioni = async (req, res) => {
  try {
    const competizioni = await Competizione.findAll({
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
          as: 'organizzatore'
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
          as: 'organizzatore'
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
          as: 'organizzatore'
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
          as: 'organizzatore'
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
  deleteFile
};
