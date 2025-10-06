const express = require('express');
const router = express.Router();
const giudiceController = require('../controllers/giudiceController');

// GET /api/giudici - Ottieni tutti i giudici 
router.get('/', giudiceController.getAllGiudici);

// GET /api/giudici/:id - Ottieni un giudice per ID
// router.get('/:id', giudiceController.getGiudiceById);

// POST /api/giudici - Crea un nuovo giudice
router.post('/', giudiceController.createGiudice);

// PUT /api/giudici/:id - Aggiorna una giudice
router.put('/:id', giudiceController.updateGiudice);

// DELETE /api/giudici/:id - Elimina un giudice
router.delete('/:id', giudiceController.deleteGiudice);

module.exports = router;