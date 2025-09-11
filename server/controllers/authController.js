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
      details: error.message
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // TODO: Gestire eventuale logica di logout, come invalidare un token o una sessione
    res.json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    res.status(500).json({
      error: 'Errore durante il logout',
      details: error.message
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, password, email, region } = req.body;
    const newUser = await UtentiLogin.create({ username, password, email, region });
    res.status(201).json({ message: 'Registrazione avvenuta con successo', user: newUser });
  } catch (error) {
    res.status(500).json({
      error: 'Errore durante la registrazione',
      details: error.message
    });
  }
};

module.exports = {
  loginUser,
  logoutUser,
  registerUser
};
