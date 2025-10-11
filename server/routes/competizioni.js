const express = require('express');
const router = express.Router();
const competizioneController = require('../controllers/competizioneController');
const { uploadFiles } = require('../middleware/upload');

// GET /api/competizioni - Ottieni tutte le competizioni
router.get('/', competizioneController.getAllCompetizioni);

// GET /api/competizioni/stato/:stato - Ottieni competizioni per stato
router.get('/stato/:stato', competizioneController.getCompetizioniByStato);

// GET /api/competizioni/:id - Ottieni una competizione per ID
router.get('/:id', competizioneController.getCompetizioneById);

// POST /api/competizioni - Crea una nuova competizione
router.post('/', competizioneController.createCompetizione);

// PUT /api/competizioni/:id - Aggiorna una competizione
router.put('/:id', competizioneController.updateCompetizione);

// DELETE /api/competizioni/:id - Elimina una competizione
router.delete('/:id', competizioneController.deleteCompetizione);

// POST /api/competizioni/:id/files - Upload file per una competizione
router.post('/:id/files', uploadFiles, competizioneController.uploadFiles);

// GET /api/competizioni/:id/files/:fileType - Download file di una competizione
router.get('/:id/files/:fileType', competizioneController.downloadFile);

// DELETE /api/competizioni/:id/files/:fileType - Elimina file di una competizione
router.delete('/:id/files/:fileType', competizioneController.deleteFile);

module.exports = router;
