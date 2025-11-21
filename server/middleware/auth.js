const jwt = require('jsonwebtoken');

// Middleware per verificare il token JWT
const authenticateToken = (req, res, next) => {
  // Estrae il token dall'header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token di accesso richiesto',
      details: 'Nessun token fornito' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token non valido',
        details: 'Token scaduto o non valido' 
      });
    }
    
    req.user = user; // Aggiunge le informazioni utente alla richiesta
    next();
  });
};

// Middleware per route pubbliche (opzionale)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
