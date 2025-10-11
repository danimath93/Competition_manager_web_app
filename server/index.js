const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const apiRoutes = require('./routes');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3050;

// Middleware
app.use(cors({
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Errore interno del server' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🏠 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
