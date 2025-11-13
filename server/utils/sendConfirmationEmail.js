const nodemailer = require('nodemailer');

// Verifica che tutte le credenziali OAuth2 siano configurate
function validateOAuth2Config() {
  const requiredVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_USER'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing OAuth2 configuration: ${missing.join(', ')}. Please check your .env file.`);
  }
}

// Crea il transporter con OAuth2
function createTransporter() {
  validateOAuth2Config();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

async function sendConfirmationEmail(to, token) {
  try {
    const transporter = createTransporter();

    console.log('Invio email di conferma a:', to);
    const confirmUrl = `${process.env.BACKEND_URL}/auth/confirm?token=${token}`;

    const mailOptions = {
      from: `"Gestore Gare Viet Vo Dao" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Gestore Gare Viet Vo Dao - Conferma la tua registrazione',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Benvenuto su Gestore Gare Viet Vo Dao!</h2>
          <p>Grazie per la registrazione.</p>
          <p>Per favore conferma il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Conferma Email
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">
            Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br>
            <a href="${confirmUrl}">${confirmUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Se non hai richiesto questa registrazione, ignora questa email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email di conferma inviata con successo:', info.messageId);
    return info;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di conferma:', error);
    throw new Error(`Impossibile inviare l'email di conferma: ${error.message}`);
  }
}

async function sendResetPasswordEmail(to, token) {
  try {
    const transporter = createTransporter();

    console.log('Invio email di reset password a:', to);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/confirm?token=${token}`;

    const mailOptions = {
      from: `"Gestore Gare Viet Vo Dao" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Gestore Gare Viet Vo Dao - Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Password</h2>
          <p>Hai richiesto il reset della password per il tuo account.</p>
          <p>Per impostare una nuova password, clicca sul pulsante qui sotto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2196F3; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">
            Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Se non hai richiesto questo reset, ignora questa email. 
            La tua password rimarrà invariata.
          </p>
          <p style="color: #666; font-size: 12px;">
            Questo link scadrà tra 1 ora.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email di reset password inviata con successo:', info.messageId);
    return info;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di reset password:', error);
    throw new Error(`Impossibile inviare l'email di reset password: ${error.message}`);
  }
}

module.exports = { sendConfirmationEmail, sendResetPasswordEmail };