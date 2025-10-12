const express = require('express');
const router = express.Router();
const atletaController = require('../controllers/atletaController');

// GET /api/atleti - Ottieni tutti gli atleti 
router.get('/', atletaController.getAllAtleti);

// GET /api/atleti/club/:clubId - Ottieni gli atleti di un club specifico
router.get('/club/:clubId', atletaController.getAtletiByClub);

// GET /api/atleti/:id - Ottieni una atleta per ID
// router.get('/:id', atletaController.getAtletaById);

// POST /api/atleti - Crea una nuova atleta
router.post('/', atletaController.createAtleta);

// PUT /api/atleti/:id - Aggiorna una atleta
router.put('/:id', atletaController.updateAtleta);

// DELETE /api/atleti/:id - Elimina una atleta
router.delete('/:id', atletaController.deleteAtleta);

module.exports = router;