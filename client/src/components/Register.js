import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { TextInput, PasswordInput } from './common';
import { checkClubExists, createClub } from '../api/clubs';
import { registerUser } from '../api/auth';
import './styles/Login.css';
import './styles/Layout.css';

const Register = () => {
  const navigate = useNavigate();
  
  // Sezione 1: credenziali utente
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sezione 2: dati club
  const [denominazione, setDenominazione] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [partitaIva, setPartitaIva] = useState('');
  const [indirizzoComune, setIndirizzoComune] = useState('');
  const [indirizzoVia, setIndirizzoVia] = useState('');
  const [indirizzoCap, setIndirizzoCap] = useState('');
  const [legaleRappresentante, setLegaleRappresentante] = useState('');
  const [direttoreTecnico, setDirettoreTecnico] = useState('');
  const [recapitoTelefonico, setRecapitoTelefonico] = useState('');
  const [clubEmail, setClubEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Funzione di redirect già presente
  const handleRegisterSuccess = () => { };

  const validateFields = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Tutti i campi delle credenziali sono obbligatori.');
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('La password deve essere di almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Le password non corrispondono.');
      return false;
    }
    if (!denominazione.trim() || !codiceFiscale.trim() ||
      !indirizzoVia.trim() || !indirizzoComune.trim() || !indirizzoCap.trim() ||
      !direttoreTecnico.trim() || !legaleRappresentante.trim() || !clubEmail.trim()) {
      setError('Tutti i campi del club contrassegnati con * sono obbligatori.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      const sendData = {
        // Prima di inserire username, email e password, faccio il trim e normalizzo
        user: {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim()
        },
        club: {
          denominazione,
          codiceFiscale,
          partitaIva,
          indirizzo: indirizzoCap && indirizzoComune && indirizzoVia ? `${indirizzoVia}, ${indirizzoComune} (${indirizzoCap})` : '',
          legaleRappresentante,
          direttoreTecnico,
          recapitoTelefonico,
          email: clubEmail
        }
      };

      const response = await registerUser(sendData);
      if (response.success) {
        setSuccess('Registrazione avvenuta! Controlla la tua email per confermare l’account.');
        setLoading(false);
        handleRegisterSuccess();
      } else {
        setError(response.message || 'Errore nella registrazione utente.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione.');
      setLoading(false);
      return;
    }
  };

  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <div className="login-container-full">
          <div className="login-left">
            <div className="login-card">
              <form onSubmit={handleSubmit} className="login-form">
                <h3 className="text-accent text-center">Benvenuto! Crea il tuo account</h3>
                
                <h6 className="text-primary text-center" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Credenziali di accesso</h6>
                
                <TextInput
                  id="username"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Inserisci username"
                  disabled={loading}
                  required
                  name="username"
                  autoComplete="username"
                />

                <TextInput
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Inserisci email"
                  disabled={loading}
                  required
                  name="email"
                  autoComplete="email"
                />

                <PasswordInput
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci password"
                  disabled={loading}
                  required
                  name="new-password"
                  autoComplete="new-password"
                />

                <PasswordInput
                  id="confirmPassword"
                  label="Conferma Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Conferma password"
                  disabled={loading}
                  required
                  name="confirm-password"
                  autoComplete="new-password"
                />

                <h6 className="text-primary text-center" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Informazioni Club</h6>
                
                <TextInput
                  id="denominazione"
                  label="Denominazione"
                  value={denominazione}
                  onChange={(e) => setDenominazione(e.target.value)}
                  placeholder="Nome del club"
                  disabled={loading}
                  required
                />

                <TextInput
                  id="codiceFiscale"
                  label="Codice Fiscale"
                  value={codiceFiscale}
                  onChange={(e) => setCodiceFiscale(e.target.value)}
                  placeholder="Codice Fiscale"
                  disabled={loading}
                  required
                />

                <TextInput
                  id="partitaIva"
                  label="Partita IVA"
                  value={partitaIva}
                  onChange={(e) => setPartitaIva(e.target.value)}
                  placeholder="Partita IVA (opzionale)"
                  disabled={loading}
                />

                <TextInput
                  id="indirizzoVia"
                  label="Sede sociale: Indirizzo"
                  value={indirizzoVia}
                  onChange={(e) => setIndirizzoVia(e.target.value)}
                  placeholder="Via, numero civico"
                  disabled={loading}
                  required
                />

                <TextInput
                  id="indirizzoComune"
                  label="Sede sociale: Comune"
                  value={indirizzoComune}
                  onChange={(e) => setIndirizzoComune(e.target.value)}
                  placeholder="Comune"
                  disabled={loading}
                  required
                />

                <TextInput
                  id="indirizzoCap"
                  label="Sede sociale: CAP"
                  value={indirizzoCap}
                  onChange={(e) => setIndirizzoCap(e.target.value)}
                  placeholder="CAP"
                  disabled={loading}
                  required
                  maxLength={5}
                />

                <TextInput
                  id="legaleRappresentante"
                  label="Legale Rappresentante"
                  value={legaleRappresentante}
                  onChange={(e) => setLegaleRappresentante(e.target.value)}
                  placeholder="Nome e cognome"
                  disabled={loading}
                  required
                />

                <TextInput
                  id="direttoreTecnico"
                  label="Direttore Tecnico"
                  value={direttoreTecnico}
                  onChange={(e) => setDirettoreTecnico(e.target.value)}
                  placeholder="Nome e cognome"
                  disabled={loading}
                  required
                />

                <TextInput
                  id="recapitoTelefonico"
                  label="Recapito Telefonico"
                  value={recapitoTelefonico}
                  onChange={(e) => setRecapitoTelefonico(e.target.value)}
                  placeholder="Numero di telefono (opzionale)"
                  disabled={loading}
                />

                <TextInput
                  id="clubEmail"
                  label="Email Club"
                  type="email"
                  value={clubEmail}
                  onChange={(e) => setClubEmail(e.target.value)}
                  placeholder="Email del club"
                  disabled={loading}
                  required
                  name="club-email"
                  autoComplete="email"
                />

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Registrazione in corso...' : 'Registrati'}
                </button>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="success-message">
                    {success}
                  </div>
                )}
              </form>

              <div className="login-footer">
                <span className="register-text">
                  Hai già un account?
                  <a
                    href="#"
                    className="register-link"
                    onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                  >
                    Accedi qui
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
