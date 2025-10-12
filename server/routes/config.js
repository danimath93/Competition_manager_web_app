const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// GET /api/config/tipi-competizione - Ottieni tutti i tipi di competizione con le loro categorie
router.get('/tipi-competizione', configController.getAllTipiCompetizione);

// GET /api/config/tipi-competizione/:id - Ottieni un tipo di competizione specifico
router.get('/tipi-competizione/:id', configController.getTipoCompetizioneById);

// GET /api/config/tipi-competizione/:tipoCompetizioneId/categorie - Ottieni le categorie di un tipo di competizione
router.get('/tipi-competizione/:tipoCompetizioneId/categorie', configController.getCategorieByTipoCompetizione);

// GET /api/config/tipi-categoria - Ottieni tutti i tipi di categoria
router.get('/tipi-categoria', configController.getAllTipiCategoria);

module.exports = router;