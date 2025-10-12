const express = require('express');
const router = express.Router();
const iscrizioneController = require('../controllers/iscrizioneController');

// GET /api/iscrizioni/competizione/:competizioneId - Ottieni tutte le iscrizioni di una competizione
router.get('/competizione/:competizioneId', iscrizioneController.getIscrizioniByCompetizione);

// GET /api/iscrizioni/competizione/:competizioneId/club/:clubId - Ottieni le iscrizioni di un club per una competizione
router.get('/competizione/:competizioneId/club/:clubId', iscrizioneController.getIscrizioniByCompetitionAndClub);

// POST /api/iscrizioni - Crea una nuova iscrizione
router.post('/', iscrizioneController.createIscrizione);

// DELETE /api/iscrizioni/:id - Elimina un'iscrizione specifica
router.delete('/:id', iscrizioneController.deleteIscrizione);

// DELETE /api/iscrizioni/atleta/:atletaId/competizione/:competizioneId - Elimina tutte le iscrizioni di un atleta per una competizione
router.delete('/atleta/:atletaId/competizione/:competizioneId', iscrizioneController.deleteIscrizioniAtleta);

module.exports = router;