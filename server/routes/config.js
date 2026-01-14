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

// GET /api/config/tipi-categoria/:id - Ottieni un tipo categoria specifico
router.get('/tipi-categoria/:id', configController.getTipoCategoriaById);

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

// GET /api/config/tipi-costi - Ottieni tutti i tipi di costi
router.get('/tipi-costi', configController.getAllTipiCosti);

// GET /api/config/tipi-costi/:id - Ottieni un tipo di costo specifico
router.get('/tipi-costi/:id', configController.getTipoCostoById);

// GET /api/config/nomi-quyen - Ottieni tutti i nomi quyen
router.get('/nomi-quyen', configController.getAllNomiQuyen);

// GET /api/config/nomi-quyen/:id - Ottieni un nome quyen specifico
router.get('/nomi-quyen/:id', configController.getNomeQuyenById);

// GET /api/config/nomi-quyen/tipo-categoria/:tipoCategoriaId - Ottieni i nomi quyen per tipo categoria
router.get('/nomi-quyen/tipo-categoria/:tipoCategoriaId', configController.getNomiQuyenByTipoCategoria);

module.exports = router;