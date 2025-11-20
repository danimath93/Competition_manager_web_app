import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../pages/styles/Login.css';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-container">
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
        <a href="/login" className="back-login-link" style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
          <span style={{ fontSize: '1.3em', marginRight: 6 }}>&larr;</span> Torna alla pagina di login
        </a>
      </div>
      <div className="login-card">
        <div className="login-header">
          <img src="/logo_ufficiale.png" alt="Logo" className="login-logo" />
          <h1 className="login-title">Imposta nuova password</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
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
