import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaChevronDown } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './styles/Header.css';

const Header = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const languageRef = useRef(null);
  const userRef = useRef(null);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const getFlagEmoji = (lang) => {
    return lang === 'it' ? '🇮🇹' : '🇬🇧';
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <img 
            src="/logo_ufficiale.png" 
            alt="Logo" 
            className="header-logo"
          />
        </div>
        <h3 className="header-title">{t('welcomeMessage')}</h3>
      </div>
      
      <div className="header-right">
        {user && (
          <div className="user-menu" ref={userRef}>
            <button 
              className="user-button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <FaUser className="user-icon" />
            </button>
            
            {showUserDropdown && (
              <div className="user-dropdown">
                <div className="user-info-dropdown">
                  <span className="user-name-dropdown">{user.username}</span>
                  <span className="user-role">{user.permissions}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="language-selector" ref={languageRef}>
          <button 
            className="language-button"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <span className="flag-emoji">{getFlagEmoji(language)}</span>
          </button>
          
          {showLanguageDropdown && (
            <div className="language-dropdown">
              <button 
                className={`language-option ${language === 'it' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('it')}
              >
                <span className="flag-emoji">🇮🇹</span>
                <span>{t('italian')}</span>
              </button>
              <button 
                className={`language-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <span className="flag-emoji">🇬🇧</span>
                <span>{t('english')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
