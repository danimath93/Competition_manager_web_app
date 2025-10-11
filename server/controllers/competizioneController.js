const { Competizione, Categoria, Club } = require('../models');

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
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni',
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
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    res.json(competizione);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero della competizione',
      details: error.message 
    });
  }
};

// Crea una nuova competizione
const createCompetizione = async (req, res) => {
  try {
    const competizione = await Competizione.create(req.body);
    res.status(201).json(competizione);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    const updatedCompetizione = await Competizione.findByPk(id);
    res.json(updatedCompetizione);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
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
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    
    res.status(204).send();
  } catch (error) {
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
          as: 'organizzatore'
        }
      ],
      order: [['dataInizio', 'ASC']]
    });
    res.json(competizioni);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero delle competizioni',
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
    
    res.json({ message: 'File eliminato con successo' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione del file',
      details: error.message 
    });
  }
};

module.exports = {
  getAllCompetizioni,
  getCompetizioneById,
  createCompetizione,
  updateCompetizione,
  deleteCompetizione,
  getCompetizioniByStato,
  uploadFiles,
  downloadFile,
  deleteFile
};
