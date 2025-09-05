import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  it: {
    // Header
    welcomeMessage: 'Benvenuto nel Gestore Gare',
    
    // Sidebar
    dashboard: 'Dashboard',
    competitions: 'Competizioni',
    athletes: 'Atleti',
    clubs: 'Club',
    judges: 'Giudici',
    categories: 'Categorie',
    settings: 'Impostazioni',
    logout: 'Esci',
    
    // Login
    login: 'Accedi',
    username: 'Nome utente',
    password: 'Password',
    loginButton: 'Accedi',
    register: 'Registrati',
    noAccount: 'Non hai un account?',
    userNotFound: 'Utente non trovato o credenziali errate',
    
    // Common
    language: 'Lingua',
    italian: 'Italiano',
    english: 'Inglese'
  },
  en: {
    // Header
    welcomeMessage: 'Welcome to Competition Manager',
    
    // Sidebar
    dashboard: 'Dashboard',
    competitions: 'Competitions',
    athletes: 'Athletes',
    clubs: 'Clubs',
    judges: 'Judges',
    categories: 'Categories',
    settings: 'Settings',
    logout: 'Logout',
    
    // Login
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    register: 'Register',
    noAccount: "Don't have an account?",
    userNotFound: 'User not found or invalid credentials',
    
    // Common
    language: 'Language',
    italian: 'Italian',
    english: 'English'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('it');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  // Carica la lingua salvata al mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
