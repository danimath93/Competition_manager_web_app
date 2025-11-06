import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import './Login.css';
import { requestPasswordReset } from '../api/auth';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('Inserisci un indirizzo email valido.');
      setLoading(false);
      return;
    }

    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setSuccess('Controlla la tua email per il reset della password.');
      } else {
        setError(response.message || 'Utente non esistente.');
      }
    } catch (err) {
      setError('Errore durante la richiesta.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo_ufficiale.png" alt="Logo" className="login-logo" />
          <h1 className="login-title">Reset Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email*</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" disabled={loading} />
            </div>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Invio richiesta...' : 'Richiedi reset password'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
