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

// genera tabellone server-side (opzionale)
router.post('/:id/generate-tabellone', svolgimentoController.generateTabellone);

// salva tabellone intero
router.put('/:id/tabellone', svolgimentoController.saveTabellone);

// imposta vincitore di un match (body: { winnerAtletaId })
router.post('/:id/match/:matchId/winner', svolgimentoController.setMatchWinner);


module.exports = router;
