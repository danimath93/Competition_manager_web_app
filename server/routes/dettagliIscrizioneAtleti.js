const express = require('express');
const router = express.Router();
const controller = require('../controllers/dettaglioIscrizioneAtletaController');

// Crea nuovo dettaglio
router.post('/', controller.createDettaglio);
// Ottieni tutti (con filtri opzionali)
router.get('/', controller.getAllDettagli);
// Ottieni per ID
router.get('/:id', controller.getDettaglioById);
// Aggiorna
router.put('/:id', controller.updateDettaglio);
// Elimina
router.delete('/:id', controller.deleteDettaglio);

module.exports = router;
