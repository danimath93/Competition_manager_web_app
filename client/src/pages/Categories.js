import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Tabs, Tab, Alert } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { getCompetitionDetails } from '../api/competitions';
import CategoryDefinition from '../components/CategoryDefinition';
import CategoryExecution from '../components/CategoryExecution';

const Categories = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // const competizioneId = searchParams.get('competizioneId');
  const competizioneId = 1;
  const [activeTab, setActiveTab] = useState(0);
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }

    loadCompetitionData();
  }, [competizioneId]);

  const loadCompetitionData = async () => {
    try {
      setLoading(true);
      const data = await getCompetitionDetails(competizioneId);
      setCompetition(data);
      setError(null);
    } catch (error) {
      console.error('Errore nel caricamento della competizione:', error);
      setError('Impossibile caricare i dati della competizione');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Caricamento...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!competition) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="warning">Competizione non trovata</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestione Categorie
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {competition.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(competition.dataInizio).toLocaleDateString('it-IT')} - {new Date(competition.dataFine).toLocaleDateString('it-IT')}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Organizzatore - Definizione Categorie" />
          <Tab label="Esecutore - Gestione Gara" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <CategoryDefinition 
          competizioneId={competizioneId}
          competition={competition}
        />
      )}

      {activeTab === 1 && (
        <CategoryExecution 
          competizioneId={competizioneId}
          competition={competition}
        />
      )}
    </Container>
  );
};

export default Categories;
