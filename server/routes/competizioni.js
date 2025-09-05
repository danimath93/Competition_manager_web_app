const express = require('express');
const router = express.Router();
const competizioneController = require('../controllers/competizioneController');

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

module.exports = router;
