import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/common/Button';
import { Box } from '@mui/material';
import { FaTachometerAlt } from 'react-icons/fa';
import './styles/CommonPageStyles.css';

const Dashboard = () => {
  const { t } = useLanguage();
  const [shouldThrowError, setShouldThrowError] = useState(false);

  const handleTestError = () => {
    setShouldThrowError(true);
  }

  // Lancia l'errore durante il rendering per essere catturato dall'ErrorBoundary
  if (shouldThrowError) {
    throw new Error('Errore di test generato dalla Dashboard');
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTachometerAlt}
        title={t('dashboard')}
        subtitle="Benvenuto nella dashboard del Gestore Gare. Qui puoi visualizzare un riepilogo delle attività principali."
      />

      <div className="page-content">
        <div className="page-section">
          <h2 className="page-section-title">Riepilogo Attività</h2>
          
          <div className="page-grid-2">
            <div className="page-card">
              <div className="page-card-header">
                <h3 className="page-card-title">Competizioni Attive</h3>
              </div>
              <div className="page-card-body">
                <p>Contenuto in fase di sviluppo...</p>
              </div>
            </div>

            <div className="page-card">
              <div className="page-card-header">
                <h3 className="page-card-title">Atleti Registrati</h3>
              </div>
              <div className="page-card-body">
                <p>Contenuto in fase di sviluppo...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="page-divider"></div>

        <div className="page-section">
          <h2 className="page-section-title">Statistiche</h2>
          <div className="page-card">
            <p>Grafici e statistiche verranno visualizzati qui.</p>
          </div>
        </div>

        <div className="page-divider"></div>

        <div className="page-section">
          <h2 className="page-section-title">Sezione di test</h2>
          <div className="page-card">
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Button
                size='s'
                onClick={() => handleTestError()}
              >
                Test errore
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
