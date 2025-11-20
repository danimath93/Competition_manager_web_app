import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-container">
      <div className="login-left">
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <h5 className="text-red text-center">{t('loginIntro')}</h5>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <h6>
                  {t('username')}
                </h6>
              </label>
              <div className="input-wrapper">
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
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">
                  <h6>
                    {t('password')}
                  </h6>
                </label>
              </div>
              <div className="input-wrapper">
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
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop"
          alt="Sports background"
          className="login-image"
        />
      </div>
    </div>
  );
};

export default Login;
