const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Genera categorie automaticamente
router.post('/competizioni/:competizioneId/generate', categoriaController.generateCategories);

// Salva le categorie sul database
router.post('/competizioni/:competizioneId/save', categoriaController.saveCategories);

// Ottieni le categorie di una competizione
router.get('/competizioni/:competizioneId/', categoriaController.getCategoriesByCompetizione);

// Ottieni le categorie di una competizione filtrate per club
router.get('/competizioni/:competizioneId/club/:clubId', categoriaController.getCategoriesByClub);

// Aggiorna una categoria
router.put('/:id', categoriaController.updateCategoria);

// DELETE /api/competizioni/:id/categorie - Elimina tutte le categorie di una competizione
router.delete('/:id/categorie', categoriaController.deleteCategoriesByCompetizione);

// Elimina una categoria
router.delete('/:id', categoriaController.deleteCategoria);

// Sposta atleti tra categorie
router.post('/move-atleti', categoriaController.moveAtleti);

// Unisci due categorie
router.post('/merge', categoriaController.mergeCategorie);

// Dividi una categoria
router.post('/split', categoriaController.splitCategoria);

module.exports = router;
