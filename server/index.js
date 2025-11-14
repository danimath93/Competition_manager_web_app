const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const apiRoutes = require('./routes');
const { authenticateToken } = require('./middleware/auth');
const logger = require('./helpers/logger/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');


const app = express();
const PORT = process.env.PORT || 3050;

// Middleware
app.use(cors({
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes pubbliche (senza autenticazione)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Martial Arts Competition Management API',
    version: '1.0.0',
    status: 'running'
  });
});

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

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    logger.info('✅ Database synchronized successfully.');
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Health check: ${process.env.BACKEND_URL}/health`);
    });
  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
