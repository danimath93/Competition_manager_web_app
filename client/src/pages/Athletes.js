import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { loadAllAthletes } from '../api/athletes';

const Athletes = () => {
  const { t } = useLanguage();

  const searchAllAthletes = async () => {
    try {
      const data = await loadAllAthletes();
      console.log('Atleti caricati:', data.athletes);
    } catch (error) {
      console.error('Errore nel recupero degli atleti:', error);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#dc3545', marginBottom: '2rem' }}>
        {t('athletes')}
      </h1>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p>Sezione per la gestione degli atleti.</p>
      </div>

      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p>Ottieni tutti gli atleti.</p>
          <button 
            type="submit" 
            className="search-button"
            onClick={() => searchAllAthletes()}
          >
          </button>
      </div>
    </div>
  );
};

export default Athletes;