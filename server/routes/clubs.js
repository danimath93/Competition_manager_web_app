const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { upload, uploadLogoMiddleware } = require('../middleware/upload');
const { uploadLogoClub } = require('../controllers/clubController');

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

// POST /api/clubs/check - Verifica se un club esiste già
router.post('/check', clubController.checkClubExists);

// PUT /api/clubs/:id/logo - Upload logo club
router.put('/:id/logo', uploadLogoMiddleware.single('logo'), uploadLogoClub);

module.exports = router;
