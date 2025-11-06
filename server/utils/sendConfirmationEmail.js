const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: process.env.GUSER || null, pass: process.env.GPASS || null },
});

async function sendConfirmationEmail(to, token) {
  if (process.env.GUSER == null || process.env.GPASS == null) {
    throw new Error('Email credentials GUSER and GPASS are not set in environment variables .env');
  }
  console.log('Invio email di conferma a:', to);
  const confirmUrl = `http://localhost:3050/api/auth/confirm?token=${token}`;
  const mailOptions = {
    from: process.env.GUSER || null,
    to,
    subject: 'Gestore Gare Viet Vo Dao - Conferma la tua registrazione',
    html: `<p>Grazie per la registrazione!<br>Per favore conferma il tuo indirizzo email cliccando sul seguente link:<br><a href="${confirmUrl}">${confirmUrl}</a></p>`
  };
  await transporter.sendMail(mailOptions);
}

async function sendResetPasswordEmail(to, token) {
  if (process.env.GUSER == null || process.env.GPASS == null) {
    throw new Error('Email credentials GUSER and GPASS are not set in environment variables .env');
  }
  console.log('Invio email di reset password a:', to);
  const resetUrl = `http://localhost:3000/reset-password/confirm?token=${token}`;
  const mailOptions = {
    from: process.env.GUSER || null,
    to,
    subject: 'Gestore Gare Viet Vo Dao - Reset Password',
    html: `<p>Hai richiesto il reset della password.<br>Per impostare una nuova password clicca sul seguente link:<br><a href="${resetUrl}">${resetUrl}</a></p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationEmail, sendResetPasswordEmail };
