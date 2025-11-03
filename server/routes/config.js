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

// GET /api/config/gruppi-eta - Ottieni tutti i gruppi età
router.get('/gruppi-eta', configController.getAllGruppiEta);

// GET /api/config/tipi-atleta - Ottieni tutti i tipi atleta
router.get('/tipi-atleta', configController.getAllTipiAtleta);

// GET /api/config/tipi-atleta/:id - Ottieni un tipo atleta specifico
router.get('/tipi-atleta/:id', configController.getTipoAtletaById);

// GET /api/config/esperienze - Ottieni tutte le esperienze
router.get('/esperienze', configController.getAllEsperienze);

// GET /api/config/esperienze/:id - Ottieni una esperienza specifica
router.get('/esperienze/:id', configController.getEsperienzaById);

// GET /api/config/tipi-atleta/:tipoAtletaId/esperienze - Ottieni le esperienze per tipo atleta
router.get('/tipi-atleta/:tipoAtletaId/esperienze', configController.getEsperienzeByTipoAtleta);

module.exports = router;