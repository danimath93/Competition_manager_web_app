const express = require('express');
const membershipTypeController = require('../controllers/membershipTypeController');

// Route pubbliche (montate prima del middleware di autenticazione): usate dalla registrazione club
const publicRouter = express.Router();

// GET /api/membership-types/association - Affiliazioni club
publicRouter.get('/association', membershipTypeController.getAssociationTypes);

// Route autenticate
const router = express.Router();

// GET /api/membership-types/competition - Tipi selezionabili nella configurazione competizione
router.get('/competition', membershipTypeController.getCompetitionTypes);

module.exports = { publicRouter, router };
