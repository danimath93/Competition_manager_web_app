const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth
});

async function sendConfirmationEmail(to, token) {
  const confirmUrl = `https://tuosito.it/api/users/confirm?token=${token}`;
  const mailOptions = {
    from: emailConfig.from,
    to,
    subject: 'Conferma la tua registrazione',
    html: `<p>Grazie per la registrazione!<br>Per confermare il tuo account clicca sul link:<br><a href="${confirmUrl}">${confirmUrl}</a></p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendConfirmationEmail;
