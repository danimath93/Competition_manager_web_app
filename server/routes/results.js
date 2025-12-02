const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

// Classifica atleti per fasce di età e genere
router.get('/atleti', resultsController.getAtletiResults);

// Classifica club
router.get('/club', resultsController.getClubResults);

// Dettaglio medaglie per club
router.get('/club/:id', resultsController.getClubMedalsDetails);

module.exports = router;
