const express = require('express');
const router = express.Router();
const giudiceController = require('../controllers/giudiceController');

// GET /api/giudici - Ottieni tutti i giudici 
router.get('/', giudiceController.getAllJudges);

// GET /api/giudici/:id - Ottieni un giudice per ID
// router.get('/:id', giudiceController.getGiudiceById);

// POST /api/giudici - Crea un nuovo giudice
router.post('/', giudiceController.createJudge);

// PUT /api/giudici/:id - Aggiorna un giudice
router.put('/:id', giudiceController.updateJudge);

// DELETE /api/giudici/:id - Elimina un giudice
router.delete('/:id', giudiceController.deleteJudge);

module.exports = router;