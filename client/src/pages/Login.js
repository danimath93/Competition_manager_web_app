import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { TextInput, PasswordInput } from '../components/common';
import '../components/styles/Login.css';
import '../components/styles/Layout.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Username o password mancanti');
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.message || t('userNotFound'));
    }
    
    setLoading(false);
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleResetPWClick = () => {
    navigate('/reset-password');
  };

  return (
    <div className="layout">
      <Header />
      <div className='layout-content'>
        <div className="login-container">
          <div className="login-left">
            <div className="login-card">
              <form onSubmit={handleSubmit} className="login-form">
                <h5 className="text-red text-center">{t('loginIntro')}</h5>
                
                <TextInput
                  id="username"
                  label={t('username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('username')}
                  disabled={loading}
                  name="username"
                  autoComplete="username"
                />

                <div className="password-field-wrapper">
                  <PasswordInput
                    id="password"
                    label={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password')}
                    disabled={loading}
                    name="password"
                    autoComplete="current-password"
                  />
                  <div className="forgot-password-link">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleResetPWClick(); }}>
                      {t('forgotPassword')}
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? t('signingIn') : t('signInButton')}
                </button>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
              </form>

              <div className="login-footer">
                <span className="register-text">
                  {t('noAccount')}
                  <a
                    href="#"
                    className="register-link"
                    onClick={(e) => { e.preventDefault(); handleRegisterClick(); }}
                  >
                    {t('registerNow')}
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="login-right">
            <img
              src="/assets/GN26_Locandina.png"
              alt="Sports background"
              className="login-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
