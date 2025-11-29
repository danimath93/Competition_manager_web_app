const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Genera categorie automaticamente
router.post('/competizioni/:competizioneId/generate', categoriaController.generateCategories);

// Salva le categorie sul database
router.post('/competizioni/:competizioneId/save', categoriaController.saveCategories);

// Ottieni le categorie di una competizione
router.get('/competizioni/:competizioneId/', categoriaController.getCategoriesByCompetizione);

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

// Salva la lettera estratta per una competizione
router.post('/competizioni/:competizioneId/lettera', categoriaController.saveExtractedLetter);

// Recupera la lettera estratta per una competizione
router.get('/competizioni/:competizioneId/lettera', categoriaController.getExtractedLetter);

// Salva lo svolgimento di una categoria
router.post('/:id/svolgimento', categoriaController.saveCategoryExecution);

// Recupera lo svolgimento di una categoria
router.get('/:id/svolgimento', categoriaController.getCategoryExecution);

module.exports = router;
