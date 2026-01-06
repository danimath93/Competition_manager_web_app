const express = require('express');
const router = express.Router();
const certificatoController = require('../controllers/certificatoController');

// Upload certificato per un atleta
router.post('/atleta/:atletaId', certificatoController.uploadCertificato);

// Download certificato di un atleta
router.get('/atleta/:atletaId/download', certificatoController.downloadCertificato);

// Ottieni informazioni sul certificato (senza scaricare il file)
router.get('/atleta/:atletaId/info', certificatoController.getCertificatoInfo);

// Elimina certificato di un atleta
router.delete('/atleta/:atletaId', certificatoController.deleteCertificato);

module.exports = router;
