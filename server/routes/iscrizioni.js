const express = require('express');
const router = express.Router();
const multer = require('multer');
const iscrizioneController = require('../controllers/iscrizioneController');

// Configurazione multer per upload file in memoria
const storage = multer.memoryStorage();
const uploadDocumenti = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo file PDF sono accettati'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite
  }
});

// ============ ISCRIZIONI ATLETI ============

// GET /api/iscrizioni/competizione/:competizioneId - Ottieni tutte le iscrizioni di una competizione
router.get('/competizione/:competizioneId', iscrizioneController.getIscrizioniByCompetizione);

// GET /api/iscrizioni/competizione/:competizioneId/club/:clubId - Ottieni le iscrizioni di un club per una competizione
router.get('/competizione/:competizioneId/club/:clubId', iscrizioneController.getIscrizioniByCompetitionAndClub);

// POST /api/iscrizioni - Crea una nuova iscrizione
router.post('/', iscrizioneController.createIscrizione);

// DELETE /api/iscrizioni/:id - Elimina un'iscrizione specifica
router.delete('/:id', iscrizioneController.deleteIscrizione);

// DELETE /api/iscrizioni/atleta/:atletaId/competizione/:competizioneId - Elimina tutte le iscrizioni di un atleta per una competizione
router.delete('/atleta/:atletaId/competizione/:competizioneId', iscrizioneController.deleteIscrizioniAtleta);

// POST /api/iscrizioni/atleta/modifica - Modifica le iscrizioni di un atleta
router.post('/atleta/modifica', iscrizioneController.editIscrizioniAtleta);

// ============ ISCRIZIONI CLUB ============

// POST /api/iscrizioni/club-iscrizione - Crea o recupera l'iscrizione di un club a una competizione
router.post('/club-iscrizione', iscrizioneController.createOrGetIscrizioneClub);

// GET /api/iscrizioni/club-iscrizione/competizione/:competizioneId - Ottieni tutte le iscrizioni dei club per una competizione
router.get('/club-iscrizione/competizione/:competizioneId', iscrizioneController.getClubRegistrationsByCompetition);

// GET /api/iscrizioni/club-iscrizione/:clubId/:competizioneId - Ottieni l'iscrizione di un club a una competizione
router.get('/club-iscrizione/:clubId/:competizioneId', iscrizioneController.getIscrizioneClub);

// POST /api/iscrizioni/club-iscrizione/documenti - Upload documenti per l'iscrizione del club
router.post('/club-iscrizione/documenti', uploadDocumenti.fields([{ name: 'confermaPresidente', maxCount: 1 }, { name: 'bonifico', maxCount: 1 }]), iscrizioneController.uploadDocumentiIscrizioneClub);

// POST /api/iscrizioni/club-iscrizione/conferma - Conferma l'iscrizione del club (dopo upload documenti)
router.post('/club-iscrizione/conferma', iscrizioneController.confermaIscrizioneClub);

// GET /api/iscrizioni/club-iscrizione/:clubId/:competizioneId/documento/:tipoDocumento - Download documento
router.get('/club-iscrizione/:clubId/:competizioneId/documento/:tipoDocumento', iscrizioneController.downloadDocumentoIscrizioneClub);

// POST /api/iscrizioni/club-iscrizione/modifica - Modfica l'iscrizione del club
router.post('/club-iscrizione/modifica', iscrizioneController.modificaIscrizioneClub);

// GET /api/iscrizioni/costs/:clubId/:competizioneId - Ottieni i costi totali per un club in una competizione
router.get('/costs/:clubId/:competizioneId', iscrizioneController.getClubRegistrationCosts);

// GET /api/iscrizioni/club-iscrizione/riepilogo/:clubId/:competizioneId - Ottieni il riepilogo iscrizione per un club in una competizione
router.get('/club-iscrizione/riepilogo/:clubId/:competizioneId', iscrizioneController.downloadClubCompetitionSummary);

module.exports = router;