const { UtentiLogin } = require('../models');

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UtentiLogin.findOne({ where: { username, password } });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    res.json({ message: 'Login effettuato con successo', user });
  } catch (error) {
    res.status(500).json({
      error: 'Errore durante il login',
      details: error.messagezzs
    });
  }
};

// inserire nuovo utente che si sta registrando per la prima volta
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;  
    const newUser = await UtentiLogin.create({ username, password });
    res.status(201).json({ message: 'Utente registrato con successo', newUser });
  } catch (error) {
    res.status(500).json({
      error: 'Errore durante la registrazione',
      details: error.message
    });
  }
};


module.exports = {
  loginUser
};
