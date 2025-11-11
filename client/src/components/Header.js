import React, { useState } from 'react';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './styles/Header.css';

const Header = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <img 
          src="/logo_ufficiale.png" 
          alt="Logo" 
          className="header-logo"
        />
        <h1 className="header-title">{t('welcomeMessage')}</h1>
      </div>
      
      <div className="header-right">
        <div className="language-selector">
          <button 
            className="language-button"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <FaGlobe className="language-icon" />
            <span>{language.toUpperCase()}</span>
            <FaChevronDown className="dropdown-icon" />
          </button>
          
          {showLanguageDropdown && (
            <div className="language-dropdown">
              <button 
                className={`language-option ${language === 'it' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('it')}
              >
                {t('italian')}
              </button>
              <button 
                className={`language-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                {t('english')}
              </button>
            </div>
          )}
        </div>
        
        {user && (
          <div className="user-info">
            <span className="user-name">Ciao, {user.username}</span>
            <button className="logout-button" onClick={logout}>
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
