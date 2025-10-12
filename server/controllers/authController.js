const { UtentiLogin } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password sono obbligatori' });
    } 

    // Lo username fornito puo; indicare sia un username che una email, inoltre controlla che l'utente sia attivo
    const user = await UtentiLogin.findOne({
      where: {
        status: 'E',
        [Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    });
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    const hash = crypto.createHash('sha256').update(password + '.' + user.username + '.' + user.salt, 'utf8').digest('hex');
    if (hash !== user.password) {
      return res.status(401).json({ error: "Credenziali errate" });
    }

    const token = jwt.sign({ username: user.username, permissions: user?.permissions }, JWT_SECRET, { expiresIn: "8h" });
    const outUser = {
      username: user.username,
      email: user.email,
      permissions: user.permissions,
      clubId: user.clubId,
    };

    res.status(200).json({ message: 'Login effettuato con successo', user: outUser, token });
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
