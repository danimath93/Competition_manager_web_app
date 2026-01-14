import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { TextInput, PasswordInput, Tabs } from './common';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { checkClubExists, createClub } from '../api/clubs';
import { registerUser } from '../api/auth';
import './styles/Layout.css';
import './styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  
  // Stato per il tab attivo
  const [activeTab, setActiveTab] = useState('club');
  
  // Configurazione dei tabs
  const tabs = [
    { label: 'Come Atleta', value: 'athlete', disabled: true },
    { label: 'Come Club', value: 'club', disabled: false }
  ];
  
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
  const [tesseramento, setTesseramento] = useState(null);

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
      !direttoreTecnico.trim() || !legaleRappresentante.trim() || !clubEmail.trim() || !tesseramento) {
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
          email: clubEmail,
          tesseramento
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
        <div className="register-container-full">
          <div className="login-left">
            <div className="register-card">
              <h3 className="text-accent text-center">Benvenuto! Crea il tuo account</h3>
              
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'club' && (
                  <form onSubmit={handleSubmit} className="register-form">
                    <h6 className="text-primary text-center register-section-title">Credenziali di accesso</h6>
                    
                    <div className="register-form-grid">
                      <TextInput
                        id="username"
                        label="Nome utente"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome utente"
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
                        placeholder="La tua email"
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
                        placeholder="La tua password"
                        disabled={loading}
                        required
                        name="new-password"
                        autoComplete="new-password"
                      />

                      <PasswordInput
                        id="confirmPassword"
                        label="Ripeti Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ripeti la password"
                        disabled={loading}
                        required
                        name="confirm-password"
                        autoComplete="new-password"
                      />

                      <h6 className="text-primary text-center register-section-title">Informazioni Club</h6>
                      
                      <TextInput
                        id="denominazione"
                        label="Denominazione"
                        value={denominazione}
                        onChange={(e) => setDenominazione(e.target.value)}
                        placeholder="Nome Club"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="indirizzoVia"
                        label="Indirizzo: Via"
                        value={indirizzoVia}
                        onChange={(e) => setIndirizzoVia(e.target.value)}
                        placeholder="Indirizzo: Via"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="indirizzoComune"
                        label="Indirizzo: Comune"
                        value={indirizzoComune}
                        onChange={(e) => setIndirizzoComune(e.target.value)}
                        placeholder="Indirizzo: Comune"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="indirizzoCap"
                        label="Indirizzo: CAP"
                        value={indirizzoCap}
                        onChange={(e) => setIndirizzoCap(e.target.value)}
                        placeholder="Indirizzo: CAP"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="codiceFiscale"
                        label="Codice Fiscale"
                        value={codiceFiscale}
                        onChange={(e) => setCodiceFiscale(e.target.value)}
                        placeholder="Codice fiscale"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="partitaIva"
                        label="Partita IVA"
                        value={partitaIva}
                        onChange={(e) => setPartitaIva(e.target.value)}
                        placeholder="Partita IVA"
                        disabled={loading}
                      />

                      <TextInput
                        id="direttoreTecnico"
                        label="Direttore tecnico"
                        value={direttoreTecnico}
                        onChange={(e) => setDirettoreTecnico(e.target.value)}
                        placeholder="Nome Direttore Tecnico"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="legaleRappresentante"
                        label="Legale Rappresentante"
                        value={legaleRappresentante}
                        onChange={(e) => setLegaleRappresentante(e.target.value)}
                        placeholder="Nome Legale rappresentante"
                        disabled={loading}
                        required
                      />

                      <TextInput
                        id="clubEmail"
                        label="Email Club"
                        type="email"
                        value={clubEmail}
                        onChange={(e) => setClubEmail(e.target.value)}
                        placeholder="Email club"
                        disabled={loading}
                        required
                        name="club-email"
                        autoComplete="email"
                      />

                      <TextInput
                        id="recapitoTelefonico"
                        label="Recapito telefonico"
                        value={recapitoTelefonico}
                        onChange={(e) => setRecapitoTelefonico(e.target.value)}
                        placeholder="Numero di telefono"
                        disabled={loading}
                      />

                      <div className="text-input-container">
                        <label className="text-input-label">
                          <h6>
                            Affiliazione
                            <span className="required-asterisk">*</span>
                          </h6>
                        </label>
                        <Autocomplete
                          id="tesseramento"
                          value={tesseramento}
                          onChange={(event, value) => setTesseramento(value)}
                          options={['FIWUK', 'ASI', 'Altro Ente']}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Seleziona affiliazione"
                              size="small"
                              required
                            />
                          )}
                          disabled={loading}
                        />
                      </div>

                      <button
                        type="submit"
                        className="login-button register-submit-button"
                        disabled={loading}
                      >
                        {loading ? 'Registrazione in corso...' : 'Iscriviti'}
                      </button>

                      {error && (
                        <div className="error-message register-messages">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="success-message register-messages">
                          {success}
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </Tabs>

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
