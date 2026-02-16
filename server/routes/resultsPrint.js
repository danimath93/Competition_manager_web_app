const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

// Stampa PDF delle classifiche finali per una competizione
router.get('/competizioni/:competizioneId/print-results', resultsController.printResults);

// Stampa PDF classifica club per una competizione
router.get('/competizioni/:competizioneId/print-club-results', resultsController.printClubResults);

module.exports = router;
