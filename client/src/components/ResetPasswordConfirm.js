import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import Header from './Header';
import { PasswordInput } from './common';
import './styles/Login.css';
import './styles/Layout.css';

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!password || !confirmPassword) {
      setError('Compila entrambi i campi.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      setLoading(false);
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('La password deve essere di almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero.');
      setLoading(false);
      return;
    }
    try {
      const response = await resetPassword(token, password);
      if (response.success) {
        setSuccess('Password aggiornata correttamente.');
      } else {
        setError(response.message || 'Errore nel reset della password.');
      }
    } catch (err) {
      setError('Errore nel reset della password.');
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
                <h5 className="text-primary text-center">Imposta nuova password</h5>
                
                <PasswordInput
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la nuova password"
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
                  placeholder="Conferma la nuova password"
                  disabled={loading}
                  required
                  name="confirm-password"
                  autoComplete="new-password"
                />

                <button
                  type="submit"
                  className="reset-password-button"
                  disabled={loading}
                >
                  {loading ? 'Reset in corso...' : 'Reset password'}
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

export default ResetPasswordConfirm;
