const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentoController = require('../controllers/documentoController');

// Configurazione multer per l'upload in memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

/**
 * @route   POST /api/documenti/upload
 * @desc    Upload di un nuovo documento
 * @body    tipoDocumento, entitaId, entitaTipo, descrizione
 * @file    documento
 * @access  Private
 */
router.post('/upload', upload.single('documento'), documentoController.uploadDocumento);

/**
 * @route   GET /api/documenti/:id/download
 * @desc    Download di un documento
 * @param   id - ID del documento
 * @access  Private
 */
router.get('/:id/download', documentoController.downloadDocumento);

/**
 * @route   GET /api/documenti/:id
 * @desc    Ottieni informazioni su un documento (senza BLOB)
 * @param   id - ID del documento
 * @access  Private
 */
router.get('/:id', documentoController.getDocumentoInfo);

/**
 * @route   DELETE /api/documenti/:id
 * @desc    Elimina un documento
 * @param   id - ID del documento
 * @access  Private
 */
router.delete('/:id', documentoController.deleteDocumento);

module.exports = router;
