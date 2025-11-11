import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import '../pages/styles/Login.css';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
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
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.');
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo_ufficiale.png" alt="Logo" className="login-logo" />
          <h1 className="login-title">Imposta nuova password</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">Nuova Password*</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" disabled={loading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Conferma Password*</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" disabled={loading} />
            </div>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Reset in corso...' : 'Reset password'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
