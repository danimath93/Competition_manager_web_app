const { UtentiLogin } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { sendConfirmationEmail, sendResetPasswordEmail } = require('../helpers/sendConfirmationEmail');
const { checkClubExistsHelper } = require('./clubController');
const logger = require('../helpers/logger/logger');

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

    const token = jwt.sign({ username: user.username, permissions: user?.permissions }, JWT_SECRET, { expiresIn: "2h" });
    const outUser = {
      username: user.username,
      email: user.email,
      permissions: user.permissions,
      clubId: user.clubId,
    };

    res.status(200).json({ ok: true, user: outUser, token });
  } catch (error) {
    logger.error(`Errore durante il login per utente ${req.body.username}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante il login',
      details: error.message
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    logger.error(`Errore durante il logout: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante il logout',
      details: error.message
    });
  }
};

const checkAuthLevel = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Token mancante' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UtentiLogin.findOne({ where: { username: decoded.username, status: 'E' } });

    if (!user) {
      return res.status(401).json({ ok: false, message: 'Utente non trovato o non attivo' });
    }
    res.status(200).json({ ok: true, user: { username: user.username, email: user.email, permissions: user.permissions, clubId: user.clubId } });
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Token non valido o scaduto' });
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
        permissions: club ? 'club' : 'user',
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
  try {
    const { token } = req.query;
    if (!token) {
      logger.warn('Nessun token fornito per la conferma utente');
      return res.status(400).json({ error: 'Token di accesso richiesto', message: 'Nessun token fornito' });
    }

    const user = await UtentiLogin.findOne({ where: { confirmationToken: token } });
    if (!user) {
      logger.warn('Token non valido o utente non trovato per la conferma utente');
      return res.status(400).json({ error: 'Token non valido o utente non trovato' });
    }
    user.status = 'E';
    user.confirmationToken = null;
    await user.save();
    logger.info(`Account confermato per utente: ${user.username}`);
    res.send('Account confermato! Ora puoi accedere.');
  } catch (error) {
    logger.error(`Errore durante la conferma account: ${error.message}`, { stack: error.stack });
    res.status(500).send('Errore nella conferma account');
  }
};

// Richiesta reset password
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email obbligatoria' });
    }
    const user = await UtentiLogin.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utente non esistente.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    await user.save();
    // Invio email
    await sendResetPasswordEmail(email, resetToken);
    return res.json({ success: true, message: 'Controlla la tua email per il reset della password.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Errore richiesta reset password', error });
  }
};

// Conferma reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token e nuova password obbligatori.' });
    }
    const user = await UtentiLogin.findOne({ where: { resetPasswordToken: token } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token non valido o utente non trovato.' });
    }
    const salt = crypto.randomBytes(10).toString('hex');
    const hashedPassword = crypto.createHash('sha256').update(password + '.' + user.username + '.' + salt, 'utf8').digest('hex');
    user.password = hashedPassword;
    user.salt = salt;
    user.resetPasswordToken = null; // invalida il token
    await user.save();
    return res.json({ success: true, message: 'Password aggiornata correttamente.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Errore nel reset della password', error });
  }
};

module.exports = {
  loginUser,
  logoutUser,
  checkAuthLevel,
  registerUser,
  confirmUser,
  requestPasswordReset,
  resetPassword,
};
