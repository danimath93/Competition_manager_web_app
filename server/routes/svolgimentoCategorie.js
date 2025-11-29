const express = require('express');
const router = express.Router();
const svolgimentoController = require('../controllers/svolgimentoCategoriaController');

// Avvia lo svolgimento di una categoria (idempotente)
router.post('/start', svolgimentoController.startSvolgimentoCategoria);

// Ottieni dati svolgimento categoria
router.get('/:id', svolgimentoController.getSvolgimentoCategoria);

// Ottieni atleti snapshot
router.get('/:id/atleti', svolgimentoController.getSvolgimentoCategoriaAtleti);

// Aggiorna svolgimento categoria (autosave)
router.patch('/:id', svolgimentoController.patchSvolgimentoCategoria);

router.get('/by-competizione/:id', svolgimentoController.getSvolgimentiByCompetizione);

module.exports = router;
