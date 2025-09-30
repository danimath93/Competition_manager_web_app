const express = require('express');
const router = express.Router();
const atletaController = require('../controllers/atletaController');

// GET /api/atleti - Ottieni tutti gli atleti 
router.get('/', atletaController.getAllAtleti);

// GET /api/atleti/stato/:stato - Ottieni atleti per stato
router.get('/stato/:stato', atletaController.getAtletiByStato);

// GET /api/atleti/:id - Ottieni una atleta per ID
router.get('/:id', atletaController.getAtletaById);

// POST /api/atleti - Crea una nuova atleta
router.post('/', atletaController.createAtleta);

// PUT /api/atleti/:id - Aggiorna una atleta
router.put('/:id', atletaController.updateAtleta);

// DELETE /api/atleti/:id - Elimina una atleta
router.delete('/:id', atletaController.deleteAtleta);

module.exports = router;