import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth';
import Header from './Header';
import { TextInput } from './common';
import './styles/Login.css';
import './styles/Layout.css';

const RequestPasswordReset = () => {
  const navigate = useNavigate();
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
    <div className="layout">
      <Header />
      <div className="layout-content">
        <div className="login-container-full">
          <div className="login-left">
            <div className="login-card">
              <form onSubmit={handleSubmit} className="login-form">
                <h5 className="text-primary text-center">Password dimenticata?</h5>
                <h6 className="text-secondary text-center p-1">Ci pensiamo noi! Inserisci la tua email qui sotto.</h6>
                
                <TextInput
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Inserisci la tua email"
                  disabled={loading}
                  required
                  name="email"
                  autoComplete="email"
                />

                <button
                  type="submit"
                  className="reset-password-button"
                  disabled={loading}
                >
                  {loading ? 'Invio richiesta...' : 'Richiedi reset password'}
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
                  <a
                    href="#"
                    className="register-link"
                    onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                  >
                    ← Torna alla pagina di login
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

export default RequestPasswordReset;
