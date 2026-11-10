const express = require('express');
const router = express.Router();
const ageGroupConfigurationController = require('../controllers/ageGroupConfigurationController');

// GET /api/age-group-configurations?clubId= - Configurazioni fasce età del club e di default
router.get('/', ageGroupConfigurationController.getAllConfigurations);

// GET /api/age-group-configurations/:id - Ottieni una configurazione per ID
router.get('/:id', ageGroupConfigurationController.getConfigurationById);

// POST /api/age-group-configurations - Crea una configurazione per il club
router.post('/', ageGroupConfigurationController.createConfiguration);

// POST /api/age-group-configurations/:id/copy - Copia una configurazione (es. default) nel club
router.post('/:id/copy', ageGroupConfigurationController.copyConfiguration);

// PUT /api/age-group-configurations/:id - Aggiorna una configurazione del club
router.put('/:id', ageGroupConfigurationController.updateConfiguration);

// DELETE /api/age-group-configurations/:id - Elimina (soft delete) una configurazione del club
router.delete('/:id', ageGroupConfigurationController.deleteConfiguration);

module.exports = router;
