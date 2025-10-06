const express = require('express');
const router = express.Router();

// Importa le routes
const clubRoutes = require('./clubs');
const competizioniRoutes = require('./competizioni');
const authRoutes = require('./auth');
const atletiRoutes = require('./atleti');
const giudiciRoutes = require('./giudici');

// Configura le routes
router.use('/clubs', clubRoutes);
router.use('/competizioni', competizioniRoutes);
router.use('/auth', authRoutes);
router.use('/atleti', atletiRoutes);
router.use('/giudici', giudiciRoutes);

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
