import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaBuilding, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../pages/styles/Login.css';
import { checkClubExists,createClub } from '../api/clubs';
import { registerUser } from '../api/auth';

const Register = () => {
  // Sezione 1: credenziali utente
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
  const handleRegisterSuccess = () => {
    // Implementa qui la logica di redirect dopo la registrazione
    // Ad esempio: window.location.href = '/login';
  };

  const validateFields = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Tutti i campi delle credenziali sono obbligatori.');
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
        user: { username, email, password },
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
    <div className="login-container">
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
        <a href="/login" className="back-login-link" style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
          <span style={{ fontSize: '1.3em', marginRight: 6 }}>&larr;</span> Torna alla pagina di login
        </a>
      </div>
      <div className="login-card">
        <div className="login-header">
          <img src="/logo_ufficiale.png" alt="Logo" className="login-logo" />
          <h1 className="login-title">Registrazione nuovo utente</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="section-title">Credenziali di accesso</h2>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username*</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="form-input" disabled={loading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email*</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" disabled={loading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password*</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" disabled={loading} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Conferma Password*</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" disabled={loading} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <h2 className="section-title">Dati Club</h2>
          <div className="form-group">
            <label htmlFor="denominazione" className="form-label">Denominazione*</label>
            <div className="input-wrapper">
              <FaBuilding className="input-icon" />
              <input type="text" id="denominazione" value={denominazione} onChange={e => setDenominazione(e.target.value)} className="form-input" disabled={loading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="codiceFiscale" className="form-label">Codice Fiscale*</label>
            <input type="text" id="codiceFiscale" value={codiceFiscale} onChange={e => setCodiceFiscale(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="partitaIva" className="form-label">Partita IVA</label>
            <input type="text" id="partitaIva" value={partitaIva} onChange={e => setPartitaIva(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="indirizzoVia" className="form-label">Sede sociale: Indirizzo*</label>
            <input type="text" id="indirizzoVia" value={indirizzoVia} onChange={e => setIndirizzoVia(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="indirizzoComune" className="form-label">Sede sociale: Comune*</label>
            <input type="text" id="indirizzoComune" value={indirizzoComune} onChange={e => setIndirizzoComune(e.target.value)} className="form-input" disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="indirizzoCap" className="form-label">Sede sociale: CAP*</label>
            <input type="text" id="indirizzoCap" value={indirizzoCap} onChange={e => setIndirizzoCap(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="legaleRappresentante" className="form-label">Legale Rappresentante*</label>
            <input type="text" id="legaleRappresentante" value={legaleRappresentante} onChange={e => setLegaleRappresentante(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="direttoreTecnico" className="form-label">Direttore Tecnico*</label>
            <input type="text" id="direttoreTecnico" value={direttoreTecnico} onChange={e => setDirettoreTecnico(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="recapitoTelefonico" className="form-label">Recapito Telefonico</label>
            <input type="text" id="recapitoTelefonico" value={recapitoTelefonico} onChange={e => setRecapitoTelefonico(e.target.value)} className="form-input" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="clubEmail" className="form-label">Email Club*</label>
            <input type="email" id="clubEmail" value={clubEmail} onChange={e => setClubEmail(e.target.value)} className="form-input" disabled={loading} />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default Register;
