const { CertificatoMedico, Atleta } = require('../models');
const multer = require('multer');
const path = require('path');

// Configurazione multer per gestire upload in memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato file non supportato. Sono accettati solo PDF e immagini.'));
    }
  }
}).single('certificato');

// Upload certificato medico per un atleta
exports.uploadCertificato = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nessun file caricato'
        });
      }

      if (!req.params.atletaId) {
        return res.status(400).json({
          success: false,
          message: 'ID atleta mancante'
        });
      }

      const { atletaId } = req.params;

      // Verifica che l'atleta esista
      const atleta = await Atleta.findByPk(atletaId);
      if (!atleta) {
        return res.status(404).json({
          success: false,
          message: 'Atleta non trovato'
        });
      }

      // Elimina il certificato esistente se presente
      if (atleta.certificatoId) {
        const certificatoEsistente = await CertificatoMedico.findOne({
          where: { id: atleta.certificatoId }
        });
        if (certificatoEsistente) {
          await atleta.update({ certificatoId: null });
          await certificatoEsistente.destroy();
        }
      }

      // Crea il nuovo certificato
      const certificato = await CertificatoMedico.create({
        atletaId,
        nomeFile: req.file.originalname,
        file: req.file.buffer,
        mimeType: req.file.mimetype,
        dimensione: req.file.size
      });

      // Aggiorna il riferimento nell'atleta se necessario
      if (atleta.certificatoId !== certificato.id) {
        await atleta.update({ certificatoId: certificato.id });
      }

      res.status(201).json({
        success: true,
        message: 'Certificato caricato con successo',
        data: {
          id: certificato.id,
          nomeFile: certificato.nomeFile,
          mimeType: certificato.mimeType,
          dimensione: certificato.dimensione,
          dataCaricamento: certificato.dataCaricamento
        }
      });
    });
  } catch (error) {
    console.error('Errore upload certificato:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'upload del certificato',
      error: error.message
    });
  }
};

// Download certificato medico
exports.downloadCertificato = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const athlete = await Atleta.findByPk(atletaId);
    const certificatoId = athlete ? athlete.certificatoId : null;
    if (!athlete || !certificatoId) {
      return res.status(404).json({
        success: false,
        message: 'Atleta o certificato non trovato'
      });
    }

    const certificato = await CertificatoMedico.findOne({
      where: { id: certificatoId }
    });

    if (!certificato) {
      return res.status(404).json({
        success: false,
        message: 'Certificato non trovato'
      });
    }

    res.setHeader('Content-Type', certificato.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${certificato.nomeFile}"`);
    res.send(certificato.file);
  } catch (error) {
    console.error('Errore download certificato:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il download del certificato',
      error: error.message
    });
  }
};

// Ottieni informazioni certificato senza scaricare il file
exports.getCertificatoInfo = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const athlete = await Atleta.findByPk(atletaId);
    const certificatoId = athlete ? athlete.certificatoId : null;
    if (!athlete || !certificatoId) {
      return res.status(404).json({
        success: false,
        message: 'Atleta o certificato non trovato'
      });
    }

    const certificato = await CertificatoMedico.findOne({
      where: { id: certificatoId },
      attributes: ['id', 'nomeFile', 'mimeType', 'dimensione', 'dataCaricamento']
    });

    if (!certificato) {
      return res.status(404).json({
        success: false,
        message: 'Certificato non trovato'
      });
    }

    res.json({
      success: true,
      data: certificato
    });
  } catch (error) {
    console.error('Errore recupero info certificato:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle informazioni del certificato',
      error: error.message
    });
  }
};

// Elimina certificato medico
exports.deleteCertificato = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const athlete = await Atleta.findByPk(atletaId);
    const certificatoId = athlete ? athlete.certificatoId : null;
    if (!athlete || !certificatoId) {
      return res.status(404).json({
        success: false,
        message: 'Atleta o certificato non trovato'
      });
    }

    const certificato = await CertificatoMedico.findOne({
      where: { id: certificatoId }
    });

    if (!certificato) {
      return res.status(404).json({
        success: false,
        message: 'Certificato non trovato'
      });
    }

    // Rimuove il riferimento dall'atleta
    await Atleta.update(
      { certificatoId: null },
      { where: { id: atletaId } }
    );

    await certificato.destroy();

    res.json({
      success: true,
      message: 'Certificato eliminato con successo'
    });
  } catch (error) {
    console.error('Errore eliminazione certificato:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione del certificato',
      error: error.message
    });
  }
};

module.exports = exports;
