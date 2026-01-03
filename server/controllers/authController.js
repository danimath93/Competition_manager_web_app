const { UtentiLogin } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { sendConfirmationEmail, sendResetPasswordEmail, createConfirmationResponsePage } = require('../helpers/sendConfirmationEmail');
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
      return res.status(401).json({ error: 'Credenziali non valide. Account non trovato.' });
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
      clubId: user.clubId
    };

    if (user.clubId) {
      const club = await db.Club.findByPk(user.clubId);
      if (club) {
        outUser.clubName = club.denominazione;
        // Da capire come gestire l'url del badge oppure se inviare un base64
        // outUser.clubBadge = club.badgeUrl;
      }
    }

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
      return res.status(401).json({ error: 'Token mancante' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UtentiLogin.findOne({ where: { username: decoded.username, status: 'E' } });

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato o non attivo' });
    }
    res.status(200).json({ ok: true, user: { username: user.username, email: user.email, permissions: user.permissions, clubId: user.clubId } });
  } catch (error) {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { user, club } = req.body;

    if (!user.username || !user.email || !user.password) {
      return res.status(400).json({ error: 'Username, email e password sono obbligatori' });
    }

    if (!club) {
      return res.status(400).json({ error: 'Registrazione per utenti singoli non autorizzata' });
    }

    if (!club.codiceFiscale) {
      return res.status(400).json({ error: 'Codice fiscale del club è obbligatorio' });
    }

    if (!club.denominazione || !club.indirizzo || !club.legaleRappresentante || !club.direttoreTecnico || !club.email) {
      return res.status(400).json({ error: 'Tutti i campi del club contrassegnati con * sono obbligatori' });
    }

    const clubExists = await checkClubExistsHelper({ codiceFiscale: club.codiceFiscale, partitaIva: club.partitaIva });
    if (clubExists) {
      return res.status(400).json({ error: 'Il club è già stato registrato.' });
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
    logger.error(`Errore durante la registrazione utente: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      error: 'Errore durante la registrazione',
      details: error.message
     });
  }
};

const confirmUser = async (req, res) => {
  try {
    const { token } = req.query;
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    if (!token) {
      logger.warn('Nessun token fornito per la conferma utente');
      return res.status(400).send(createConfirmationResponsePage({
        title: 'Errore di Conferma',
        message: 'Token di accesso mancante o non valido.',
        status: 'error',
        redirectUrl: loginUrl
      }));
    }

    const user = await UtentiLogin.findOne({ where: { confirmationToken: token } });
    if (!user) {
      logger.warn('Token non trovato tra gli user per la conferma utente');
      return res.status(400).send(createConfirmationResponsePage({
        title: 'Token Non Valido',
        message: 'Il token di conferma non è valido o è scaduto.',
        details: 'Per favore richiedi una nuova email di conferma.',
        status: 'error',
        redirectUrl: loginUrl
      }));
    }

    user.status = 'E';
    user.confirmationToken = null;
    await user.save();
    logger.info(`Account confermato per utente: ${user.username}`);
    
    return res.status(200).send(createConfirmationResponsePage({
      title: 'Account Confermato!',
      message: 'Il tuo account è stato confermato con successo.',
      details: 'Ora puoi effettuare il login e iniziare ad utilizzare l\'applicazione.',
      status: 'success',
      redirectUrl: loginUrl
    }));
  } catch (error) {
    logger.error(`Errore durante la conferma account: ${error.message}`, { stack: error.stack });
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    return res.status(500).send(createConfirmationResponsePage({
      title: 'Errore',
      message: 'Si è verificato un errore durante la conferma dell\'account.',
      details: 'Per favore riprova più tardi o contatta l\'assistenza.',
      status: 'warning',
      redirectUrl: loginUrl
    }));
  }
};

// Richiesta reset password
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email obbligatoria' });
    }
    const user = await UtentiLogin.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Utente non esistente per l\'email fornita.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    await user.save();
    // Invio email
    await sendResetPasswordEmail(email, resetToken);
    return res.json({ success: true, message: 'Controlla la tua email per il reset della password.' });
  } catch (error) {
    logger.error(`Errore durante la richiesta di reset password: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ 
      error: 'Errore nel reset della password',
      details: error.message
     });
  }
};

// Conferma reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token e nuova password obbligatori' });
    }
    const user = await UtentiLogin.findOne({ where: { resetPasswordToken: token } });
    if (!user) {
      return res.status(400).json({ error: 'Token non valido o utente non trovato' });
    }
    const salt = crypto.randomBytes(10).toString('hex');
    const hashedPassword = crypto.createHash('sha256').update(password + '.' + user.username + '.' + salt, 'utf8').digest('hex');
    user.password = hashedPassword;
    user.salt = salt;
    user.resetPasswordToken = null; // invalida il token
    await user.save();
    return res.json({ success: true, message: 'Password aggiornata correttamente.' });
  } catch (error) {
    logger.error(`Errore durante il reset della password: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ 
      error: 'Errore nel reset della password',
      details: error.message
     });
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
