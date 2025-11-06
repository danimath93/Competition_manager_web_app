const { UtentiLogin } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../models');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');
const { checkClubExistsHelper } = require('./clubController');

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
    const { user, club } = req.body;

    if (!user.username || !user.email || !user.password) {
      return res.status(400).json({ success: false, message: 'Username, email e password sono obbligatori' });
    }

    if (!club) {
      return res.status(400).json({ success: false, message: 'Registrazione per utenti singoli non autorizzata' });
    }

    const clubExists = await checkClubExistsHelper({ codiceFiscale: club.codiceFiscale, partitaIva: club.partitaIva });
    if (clubExists) {
      return res.status(400).json({ success: false, message: 'Il club è già stato registrato.' });
    }

    // Utilizzo una transaction per assicurarmi che l'utente venga creato correttamente
    const transaction = await db.sequelize.transaction();

    try {
      const createClubResult = await db.Club.create(club, { transaction });

      if (!createClubResult || !createClubResult.id) {
        throw new Error('Errore nella creazione del club.');
      }

      var clubId = createClubResult.id;
      const salt = crypto.randomBytes(10).toString('hex');
      const hashedPassword = crypto.createHash('sha256').update(user.password + '.' + user.username + '.' + salt, 'utf8').digest('hex');
      const confirmationToken = crypto.randomBytes(32).toString('hex');

      await UtentiLogin.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        salt,
        clubId: clubId || null,
        status: 'S',
        permissions: 'user',
        confirmationToken
      }, { transaction });

      await sendConfirmationEmail(user.email, confirmationToken);

      await transaction.commit();

      res.json({ message: 'Registrazione avvenuta con successo.', success: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore registrazione utente', error });
  }
};

const confirmUser = async (req, res) => {
  console.log('[confirmUser] INIZIO', req.query);
  try {
    const { token } = req.query;
    if (!token) {
      console.error('[confirmUser] Nessun token fornito');
      return res.status(400).json({ error: 'Token di accesso richiesto', message: 'Nessun token fornito' });
    }
    console.log('[confirmUser] Token ricevuto:', token);
    const user = await UtentiLogin.findOne({ where: { confirmationToken: token } });
    if (!user) {
      console.error('[confirmUser] Token non valido o utente non trovato');
      return res.status(400).json({ error: 'Token non valido o utente non trovato' });
    }
    user.status = 'E';
    user.confirmationToken = null;
    await user.save();
    console.log('[confirmUser] Account confermato per utente:', user.username);
    res.send('Account confermato! Ora puoi accedere.');
  } catch (error) {
    console.error('[confirmUser] ERRORE:', error);
    res.status(500).send('Errore nella conferma account');
  }
};

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  confirmUser,
};
