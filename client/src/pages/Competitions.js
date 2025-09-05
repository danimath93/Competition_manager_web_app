import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Competitions = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1 style={{ color: '#dc3545', marginBottom: '2rem' }}>
        {t('competitions')}
      </h1>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p>Sezione per la gestione delle competizioni.</p>
      </div>
    </div>
  );
};

export default Competitions;
