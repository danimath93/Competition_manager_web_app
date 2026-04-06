const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

// Categorie con risultati inclusi
router.get('/categories', resultsController.getCategoriesWithResults);

// Classifica atleti per fasce di età e genere
router.get('/atleti', resultsController.getAtletiResults);

// Classifica club
router.get('/club', resultsController.getClubResults);

// Dettaglio medaglie per club
router.get('/club/:id', resultsController.getClubMedalsDetails);

// Stampa PDF delle classifiche finali per una competizione
router.get('/competizioni/:competizioneId/print-results', resultsController.printResults);

// Stampa PDF classifica club per una competizione
router.get('/competizioni/:competizioneId/print-club-results', resultsController.printClubResults);

module.exports = router;
