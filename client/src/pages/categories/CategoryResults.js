import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCompetitionDetails } from '../../api/competitions';

const CategoryResults = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const competizioneId = searchParams.get('competizioneId');
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }

    loadCompetitionData();
  }, [competizioneId, user]);

  const loadCompetitionData = async () => {
    try {
      setLoading(true);
      const data = await getCompetitionDetails(competizioneId);
      setCompetition(data);
      
      // Controllo permessi
      const userPermissions = user?.permissions || '';
      const userClubId = user?.clubId;
      
      const isAdmin = userPermissions === 'admin' || userPermissions === 'superAdmin';
      const isOrganizer = userPermissions === 'club' && userClubId === data.organizzatoreClubId;
      
      setHasPermission(isAdmin || isOrganizer);
      setError(null);
    } catch (error) {
      console.error('Errore nel caricamento della competizione:', error);
      setError('Impossibile caricare i dati della competizione');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/categories');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </Button>
      </Container>
    );
  }

  if (!competition) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="warning">Competizione non trovata</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </Button>
      </Container>
    );
  }

  if (!hasPermission) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={handleGoBack}
            sx={{ mb: 2 }}
          >
            Torna a tutte le categorie
          </Button>
        </Box>
        
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Permesso Negato
          </Typography>
          <Typography variant="body2">
            Non hai i permessi necessari per accedere ai risultati delle categorie di questa competizione.
            {' '}Solo gli amministratori o il club organizzatore possono accedere a questa sezione.
          </Typography>
        </Alert>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {competition.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(competition.dataInizio).toLocaleDateString('it-IT')} - {new Date(competition.dataFine).toLocaleDateString('it-IT')}
          </Typography>
          {competition.organizzatore && (
            <Typography variant="body2" color="text.secondary">
              Organizzatore: {competition.organizzatore.denominazione}
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Torna a tutte le categorie
        </Button>
        
        <Typography variant="h4" gutterBottom>
          Risultati
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {competition.nome}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {new Date(competition.dataInizio).toLocaleDateString('it-IT')} - {new Date(competition.dataFine).toLocaleDateString('it-IT')}
          </Typography>
          <Chip label={competition.stato} color="primary" size="small" />
        </Box>
        {competition.organizzatore && (
          <Typography variant="body2" color="text.secondary">
            Organizzatore: {competition.organizzatore.denominazione}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          La funzionalità di visualizzazione risultati è in fase di sviluppo.
          Qui sarà possibile visualizzare i risultati finali delle categorie della competizione.
        </Alert>
      </Paper>
    </Container>
  );
};

export default CategoryResults;
