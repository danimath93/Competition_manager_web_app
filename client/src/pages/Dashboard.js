import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import { sendConfirmationEmail } from '../api/auth';

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1 style={{ color: '#dc3545', marginBottom: '2rem' }}>
        {t('dashboard')}
      </h1>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p>Benvenuto nella dashboard del Gestore Gare!</p>
        <p>Qui puoi visualizzare un riepilogo delle attività principali.</p>
      </div>
    </div>
  );
};

export default Dashboard;
