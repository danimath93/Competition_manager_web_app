const { google } = require('googleapis');
const logger = require('../helpers/logger/logger');

// Verifica che tutte le credenziali OAuth2 siano configurate
function validateOAuth2Config() {
  const requiredVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_USER'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing OAuth2 configuration: ${missing.join(', ')}. Please check your .env file.`);
  }
}

// Crea il client OAuth2
async function createOAuth2Client() {
  validateOAuth2Config();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  // Verifica e aggiorna il token se necessario
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    logger.info('Access token refreshed successfully');
  } catch (error) {
    logger.error('Error refreshing access token:', error.message);
    throw new Error(`OAuth2 refresh failed: ${error.message}. Il refresh token potrebbe essere scaduto. Genera un nuovo refresh token.`);
  }

  return oauth2Client;
}

// Crea l'email in formato RFC 2822
function createEmail(to, subject, htmlBody) {
  const from = process.env.GMAIL_USER;
  const messageParts = [
    `From: "Gestore Gare Viet Vo Dao" <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ];
  const message = messageParts.join('\n');

  // Codifica in base64url
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
}

// Invia email usando Gmail API
async function sendEmailViaGmailAPI(to, subject, htmlBody) {
  try {
    const oauth2Client = await createOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const raw = createEmail(to, subject, htmlBody);

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: raw
      }
    });

    logger.info('Email inviata con successo via Gmail API:', result.data.id);
    return result.data;
  } catch (error) {
    logger.error('Errore nell\'invio email via Gmail API:', error);
    
    // Diagnostica errori comuni
    if (error.message.includes('invalid_grant')) {
      throw new Error('Il refresh token è scaduto o non valido. Genera un nuovo refresh token da OAuth Playground.');
    }
    if (error.message.includes('insufficient authentication scopes')) {
      throw new Error('Permessi insufficienti. Assicurati che il token abbia lo scope https://www.googleapis.com/auth/gmail.send');
    }
    
    throw new Error(`Impossibile inviare l'email: ${error.message}`);
  }
}

async function sendConfirmationEmail(to, token) {
  try {
    logger.info('Invio email di conferma a:', to);
    const confirmUrl = `${process.env.BACKEND_URL}/auth/confirm?token=${token}`;

    const htmlBody = `
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
    `;

    const result = await sendEmailViaGmailAPI(
      to,
      'Gestore Gare Viet Vo Dao - Conferma la tua registrazione',
      htmlBody
    );

    return result;
  } catch (error) {
    logger.error('Errore nell\'invio dell\'email di conferma:', error);
    throw new Error(`Impossibile inviare l'email di conferma: ${error.message}`);
  }
}

async function sendResetPasswordEmail(to, token) {
  try {
    logger.info('Invio email di reset password a:', to);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/confirm?token=${token}`;

    const htmlBody = `
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
    `;

    const result = await sendEmailViaGmailAPI(
      to,
      'Gestore Gare Viet Vo Dao - Reset Password',
      htmlBody
    );

    return result;
  } catch (error) {
    logger.error('Errore nell\'invio dell\'email di reset password:', error);
    throw new Error(`Impossibile inviare l'email di reset password: ${error.message}`);
  }
}

// Crea una pagina HTML di risposta con messaggio e redirect
function createConfirmationResponsePage({ title, message, details, status = 'info', redirectUrl, redirectDelay = 5 }) {
  const statusConfig = {
    success: {
      icon: '✓',
      color: '#4caf50',
      buttonColor: '#4caf50',
      buttonHover: '#45a049'
    },
    error: {
      icon: '❌',
      color: '#f44336',
      buttonColor: '#667eea',
      buttonHover: '#5568d3'
    },
    warning: {
      icon: '⚠️',
      color: '#ff9800',
      buttonColor: '#667eea',
      buttonHover: '#5568d3'
    },
    info: {
      icon: 'ℹ️',
      color: '#2196F3',
      buttonColor: '#2196F3',
      buttonHover: '#1976D2'
    }
  };

  const config = statusConfig[status] || statusConfig.info;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
          color: ${config.color};
        }
        h1 { 
          color: #333; 
          margin-bottom: 20px; 
        }
        p { 
          color: #666; 
          line-height: 1.6;
          margin: 10px 0;
        }
        .redirect-info {
          margin-top: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 5px;
          font-size: 14px;
          color: #666;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 30px;
          background: ${config.buttonColor};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background 0.3s;
        }
        .button:hover { 
          background: ${config.buttonHover}; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">${config.icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        ${details ? `<p>${details}</p>` : ''}
        <div class="redirect-info">
          Verrai reindirizzato alla pagina di login tra <span id="countdown">${redirectDelay}</span> secondi...
        </div>
        <a href="${redirectUrl}" class="button">Vai al Login</a>
      </div>
      <script>
        let seconds = ${redirectDelay};
        const countdown = document.getElementById('countdown');
        const interval = setInterval(() => {
          seconds--;
          countdown.textContent = seconds;
          if (seconds <= 0) {
            clearInterval(interval);
            window.location.href = '${redirectUrl}';
          }
        }, 1000);
      </script>
    </body>
    </html>
  `;
}

module.exports = { sendConfirmationEmail, sendResetPasswordEmail, createConfirmationResponsePage };