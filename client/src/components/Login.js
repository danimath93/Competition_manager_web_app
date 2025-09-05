import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Inserisci username e password');
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    
    if (!result.success) {
      setError(t('userNotFound'));
    }
    
    setLoading(false);
  };

  const handleRegisterClick = () => {
    // Qui puoi implementare la navigazione alla pagina di registrazione
    console.log('Redirect to register page');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="/logo_ufficiale.png" 
            alt="Logo" 
            className="login-logo"
          />
          <h1 className="login-title">{t('login')}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              {t('username')}
            </label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username')}
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('password')}
            </label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                className="form-input"
                disabled={loading}
              />
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

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Accesso...' : t('loginButton')}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p className="register-text">
            {t('noAccount')}
          </p>
          <button 
            className="register-button"
            onClick={handleRegisterClick}
            disabled={loading}
          >
            {t('register')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
