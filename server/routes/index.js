const express = require('express');
const router = express.Router();

// Importa le routes
const clubRoutes = require('./clubs');
const competizioniRoutes = require('./competizioni');
const authRoutes = require('./auth');
const atletiRoutes = require('./atleti');
const giudiciRoutes = require('./giudici');
const iscrizioniRoutes = require('./iscrizioni');
const configRoutes = require('./config');
const categorieRoutes = require('./categorie');
const svolgimentoCategorieRouter = require('./svolgimentoCategorie');
const resultsRoutes = require('./results');
const certificatiRoutes = require('./certificati');
// Configura le routes
router.use('/clubs', clubRoutes);
router.use('/competizioni', competizioniRoutes);
router.use('/auth', authRoutes);
router.use('/atleti', atletiRoutes);
router.use('/giudici', giudiciRoutes);
router.use('/iscrizioni', iscrizioniRoutes);
router.use('/config', configRoutes);
router.use('/categorie', categorieRoutes);
router.use('/svolgimento-categorie', svolgimentoCategorieRouter);
router.use('/results', resultsRoutes);
router.use('/certificati', certificatiRoutes);
// Route di test per verificare che l'API funzioni
router.get('/', (req, res) => {
  res.json({
    message: 'Martial Arts Competition Management API',
    version: '1.0.0',
    endpoints: {
      clubs: '/api/clubs',
      competizioni: '/api/competizioni',
      atleti: '/api/atleti',
      giudic: '/api/giudici',
      health: '/api/health'
    }
  });
});

module.exports = router;
