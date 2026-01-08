const { Documento, Club, Competizione, IscrizioneClub } = require('../models');
const logger = require('../helpers/logger/logger');

/**
 * Upload di un documento
 * @param {Object} req.body - { tipoDocumento, entitaId, entitaTipo (club|competizione|iscrizione_club), descrizione }
 * @param {Object} req.file - File caricato
 */
const uploadDocumento = async (req, res) => {
  try {
    const { tipoDocumento, descrizione } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    if (!tipoDocumento) {
      return res.status(400).json({ error: 'Tipo documento obbligatorio' });
    }

    const { entitaId, entitaTipo } = req.body;
    if (!entitaId || !entitaTipo) {
      return res.status(400).json({ error: 'entitaId ed entitaTipo sono obbligatori' });
    }

    // Validazione tipi documento ammessi
    const tipiDocumentoValidi = [
      'logo_club',
      'circolare_gara',
      'file_extra1_competizione',
      'file_extra2_competizione',
      'locandina_competizione',
      'conferma_presidente',
      'altro'
    ];

    if (!tipiDocumentoValidi.includes(tipoDocumento)) {
      return res.status(400).json({ error: 'Tipo documento non valido' });
    }

    // Crea il documento
    const documento = await Documento.create({
      nomeFile: file.originalname,
      file: file.buffer,
      mimeType: file.mimetype,
      dimensione: file.size,
      tipoDocumento,
      descrizione: descrizione || null
    });

    // Associa il documento all'entità specificata
    await associateDocumentoToEntity(documento.id, entitaId, entitaTipo, tipoDocumento);

    logger.info(`Documento caricato - ID: ${documento.id}, Tipo: ${tipoDocumento}`);

    res.status(201).json({
      id: documento.id,
      nomeFile: documento.nomeFile,
      mimeType: documento.mimeType,
      dimensione: documento.dimensione,
      tipoDocumento: documento.tipoDocumento,
      descrizione: documento.descrizione,
      dataCaricamento: documento.dataCaricamento
    });
  } catch (error) {
    logger.error(`Errore nell'upload del documento: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nell\'upload del documento',
      details: error.message
    });
  }
};

/**
 * Download di un documento
 * @param {Number} req.params.id - ID del documento
 */
const downloadDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByPk(id);

    if (!documento) {
      logger.warn(`Tentativo di download documento inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Documento non trovato' });
    }

    // Imposta gli header per il download
    res.set({
      'Content-Type': documento.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(documento.nomeFile)}"`,
      'Content-Length': documento.file.length
    });

    logger.info(`Download documento - ID: ${id}, Nome: ${documento.nomeFile}`);
    res.send(documento.file);
  } catch (error) {
    logger.error(`Errore nel download del documento ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel download del documento',
      details: error.message
    });
  }
};

/**
 * Visualizza informazioni di un documento (senza il BLOB)
 * @param {Number} req.params.id - ID del documento
 */
const getDocumentoInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByPk(id, {
      attributes: { exclude: ['file'] }
    });

    if (!documento) {
      logger.warn(`Tentativo di recupero info documento inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Documento non trovato' });
    }

    res.json(documento);
  } catch (error) {
    logger.error(`Errore nel recupero info documento ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel recupero delle informazioni del documento',
      details: error.message
    });
  }
};

/**
 * Elimina un documento
 * @param {Number} req.params.id - ID del documento
 */
const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { entitaId, entitaTipo, tipoDocumento } = req.body;

    if (!entitaId || !entitaTipo || !tipoDocumento) {
      return res.status(400).json({ error: 'entitaId, entitaTipo e tipoDocumento sono obbligatori' });
    }

    const documento = await Documento.findByPk(id);

    if (!documento) {
      logger.warn(`Tentativo di eliminazione documento inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Documento non trovato' });
    }

    // Rimuovi i riferimenti nelle entità prima di eliminare il documento
    await removeRiferimentiDocumento(entitaId, entitaTipo, tipoDocumento);

    await documento.destroy();

    logger.info(`Documento eliminato - ID: ${id}, Nome: ${documento.nomeFile}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Errore nell'eliminazione del documento ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nell\'eliminazione del documento',
      details: error.message
    });
  }
};

// Funzione di utilità per rimuovere i riferimenti al documento prima di eliminarlo
const removeRiferimentiDocumento = async (entitaId, entitaTipo, tipoDocumento) => {
  switch (entitaTipo) {
    case 'club':
      await Club.update(
        { logoId: null },
        { where: { id: entitaId } }
      );
      break;
    case 'competizione':
      // Determina quale campo azzerare in base al tipoDocumento
      let updateField = {};
      if (tipoDocumento === 'circolare_gara') {
        updateField = { circolareGaraId: null };
      } else if (tipoDocumento === 'locandina_competizione') {
        updateField = { locandinaId: null };
      } else if (tipoDocumento === 'file_extra1_competizione') {
        updateField = { fileExtra1Id: null };
      } else if (tipoDocumento === 'file_extra2_competizione') {
        updateField = { fileExtra2Id: null };
      }
      await Competizione.update(
        updateField,
        { where: { id: entitaId } }
      );
      break;
    case 'iscrizione_club':
      await IscrizioneClub.update(
        { confermaPresidenteId: null },
        { where: { id: entitaId } }
      );
      break;
    default:
      // Se tipo non riconosciuto, non fare niente
      break;
  }
};

// Funzione di utilità per associare un documento a un'entità
const associateDocumentoToEntity = async (documentoId, entitaId, entitaTipo, tipoDocumento) => {
  switch (entitaTipo) {
    case 'club':
      await Club.update(
        { logoId: documentoId },
        { where: { id: entitaId } }
      );
      break;
    case 'competizione':
      // Determina quale campo aggiornare in base al tipoDocumento
      let updateField = {};
      if (tipoDocumento === 'circolare_gara') {
        updateField = { circolareGaraId: documentoId };
      } else if (tipoDocumento === 'locandina_competizione') {
        updateField = { locandinaId: documentoId };
      } else if (tipoDocumento === 'file_extra1_competizione') {
        updateField = { fileExtra1Id: documentoId };
      } else if (tipoDocumento === 'file_extra2_competizione') {
        updateField = { fileExtra2Id: documentoId };
      } else {
        throw new Error('Tipo documento non valido per competizione');
      }
      await Competizione.update(
        updateField,
        { where: { id: entitaId } }
      );
      break;
    case 'iscrizione_club':
      await IscrizioneClub.update(
        { confermaPresidenteId: documentoId },
        { where: { id: entitaId } }
      );
      break;
    default:
      throw new Error('Tipo entità non valido per l\'associazione del documento');
  }
}

module.exports = {
  uploadDocumento,
  downloadDocumento,
  getDocumentoInfo,
  deleteDocumento
};
