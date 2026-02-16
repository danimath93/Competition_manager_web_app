const express = require('express');
const router = express.Router();
const competizioneController = require('../controllers/competizioneController');
const { uploadFiles } = require('../middleware/upload');

// GET /api/competizioni - Ottieni tutte le competizioni
router.get('/', competizioneController.getAllCompetizioni);

// GET /api/competizioni/stato/:stato - Ottieni competizioni per stato
router.get('/stato/:stato', competizioneController.getCompetizioniByStato);

// GET /api/competizioni/tipologia/:tipologiaId - Ottieni competizioni per tipologia
router.get('/tipologia/:tipologiaId', competizioneController.getCompetizioniByTipologia);

// GET /api/competizioni/:competizioneId/tipocategorie - Ottieni le categorie di una competizione
router.get('/:competizioneId/tipocategorie', competizioneController.getTipoCategorieByCompetizione);

// GET /api/competizioni/:id - Ottieni una competizione per ID
router.get('/:id', competizioneController.getCompetizioneById);

// POST /api/competizioni - Crea una nuova competizione
router.post('/', competizioneController.createCompetizione);

// PUT /api/competizioni/:id - Aggiorna una competizione
router.put('/:id', competizioneController.updateCompetizione);

// DELETE /api/competizioni/:id - Elimina una competizione
router.delete('/:id', competizioneController.deleteCompetizione);

// GET /api/competizioni/:competizioneId/riepilogo-iscrizione - Riepilogo costi e atleti dettagliato per club
router.get('/:competizioneId/riepilogo-iscrizione', competizioneController.getCompetitionClubRegistrationSummary);

// GET /api/competizioni/:competizioneId/print-categories - Stampa categorie in PDF
router.get('/:competizioneId/print-categories', competizioneController.printCategories);

// GET /api/competizioni/:competizioneId/export-categories - Esporta categorie in Excel
router.get('/:competizioneId/export-categories', competizioneController.exportCategories);

// GET /api/competizioni/:competizioneId/export-reg-athletes?mode=simple|full - Esporta atleti iscritti in Excel
router.get('/:competizioneId/export-reg-athletes', competizioneController.exportRegisteredAthletes);

module.exports = router;
