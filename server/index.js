const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

const { sequelize } = require('./models');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const packageJson = require('./package.json');
const apiRoutes = require('./routes');
const logger = require('./helpers/logger/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3050;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Test database connection (pubblico)
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// Route di autenticazione (senza middleware auth)
app.use('/api/auth', require('./routes/auth'));

// Applica il middleware di autenticazione a tutte le altre API routes  
app.use('/api', authenticateToken, apiRoutes);

// Error handler (deve essere l'ultimo middleware)
app.use(errorHandler);

(async () => {
  console.log(`<< Competition manager backend >> (${packageJson.version})`);
  logger.info(`${packageJson.name} v${packageJson.version}`);

  // Inizializza il database e sincronizza i modelli
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully.');
  } catch (error) {
    logger.error("Errore durante la sincronizzazione del database:", error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check: ${process.env.BACKEND_URL}/health`);
  });

    // Listener globale per errori non catturati
  process.on('uncaughtException', (err) => {
    logger.error(`Errore non catturato: ${err.message}`, err);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Promessa non gestita:', reason);
  });

})();
