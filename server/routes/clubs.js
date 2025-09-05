const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

// GET /api/clubs - Ottieni tutti i club
router.get('/', clubController.getAllClubs);

// GET /api/clubs/:id - Ottieni un club per ID
router.get('/:id', clubController.getClubById);

// POST /api/clubs - Crea un nuovo club
router.post('/', clubController.createClub);

// PUT /api/clubs/:id - Aggiorna un club
router.put('/:id', clubController.updateClub);

// DELETE /api/clubs/:id - Elimina un club
router.delete('/:id', clubController.deleteClub);

module.exports = router;
