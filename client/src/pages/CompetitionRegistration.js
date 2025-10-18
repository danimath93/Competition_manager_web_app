import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCompetitionDetails } from '../api/competitions';
import { loadAthletesByClub } from '../api/athletes';
import { loadRegistrationsByCompetitionAndClub, confirmClubRegistration, editClubRegistration } from '../api/registrations';
import ClubAthletesList from '../components/ClubAthletesList';
import RegisteredAthletesList from '../components/RegisteredAthletesList';
import { set } from 'date-fns';

const CompetitionRegistration = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [competition, setCompetition] = useState(null);
  const [clubAthletes, setClubAthletes] = useState([]);
  const [registeredAthletes, setRegisteredAthletes] = useState([]);
  const [isClubRegistered, setIsClubRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica i dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verifica che l'utente abbia un club associato
        if (!user?.clubId) {
          setError('Utente non associato a nessun club');
          return;
        }

        // Carica i dettagli della competizione
        const competitionData = await getCompetitionDetails(competitionId);
        setCompetition(competitionData);

        // Carica gli atleti del club
        const athletesData = await loadAthletesByClub(user.clubId);
        setClubAthletes(athletesData);

        // Carica gli atleti già iscritti alla competizione per questo club
        const registrationsData = await loadRegistrationsByCompetitionAndClub(
          competitionId,
          user.clubId
        );
        setRegisteredAthletes(registrationsData);

      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError('Errore nel caricamento dei dati della competizione');
      } finally {
        setLoading(false);
      }
    };

    if (competitionId && user) {
      fetchData();
    }
  }, [competitionId, user]);

  useEffect(() => {
    setIsClubRegistered(checkClubRegistered());
  }, [competition, user]);

  // Funzione per aggiornare la lista degli atleti iscritti
  const refreshRegistrations = async () => {
    try {
      const registrationsData = await loadRegistrationsByCompetitionAndClub(
        competitionId,
        user.clubId
      );
      setRegisteredAthletes(registrationsData);
    } catch (err) {
      console.error('Errore nel ricaricamento delle iscrizioni:', err);
    }
  };

  const checkClubRegistered = () => {
    if (competition && user?.clubId) {
      if (competition?.clubIscritti?.includes(user.clubId)) {
        return true;
      }
    }
    return false;
  };

  const handleGoBack = () => {
    navigate('/competitions');
  };

  const handleConfirmRegistration = () => {
    return async () => {
      try {
        await confirmClubRegistration(competitionId, user?.clubId);

        const competitionData = await getCompetitionDetails(competitionId);
        setCompetition(competitionData);
      }
      catch (err) {
        console.error('Errore durante la conferma dell\'iscrizione:', err);
        setError('Errore durante la conferma dell\'iscrizione');
      }
    };
  };

  const handleEditRegistration = () => {
    return async () => {
      try {
        await editClubRegistration(competitionId, user.clubId);
        const competitionData = await getCompetitionDetails(competitionId);
        setCompetition(competitionData);
      } catch (err) {
        console.error('Errore durante la modifica dell\'iscrizione:', err);
        setError('Errore durante la modifica dell\'iscrizione');
      }
    };
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna alle Competizioni
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Torna alle Competizioni
        </Button>
        
        <Typography variant="h4" gutterBottom>
          Iscrizione alla Competizione
        </Typography>
        
        {competition && (
          <Typography variant="h6" color="text.secondary">
            {competition.nome} - {competition.luogo}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        {!isClubRegistered && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmRegistration(false)}
          >
            Conferma iscrizione
          </Button>
        )}
        {isClubRegistered && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEditRegistration(true)}
          >
            Modifica iscrizione
          </Button>
        )}
      </Box>

      {/* Layout a due colonne */}
      <Grid container spacing={3}>
        {/* Colonna sinistra - Atleti del club */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Atleti del Club
            </Typography>
            <ClubAthletesList
              athletes={clubAthletes}
              competitionId={competitionId}
              isClubRegistered={isClubRegistered}
              onRegistrationSuccess={refreshRegistrations}
            />
          </Paper>
        </Grid>

        {/* Colonna destra - Atleti iscritti */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Atleti Iscritti alla Gara
            </Typography>
            <RegisteredAthletesList
              registrations={registeredAthletes}
              competitionId={competitionId}
              isClubRegistered={isClubRegistered}
              onRegistrationChange={refreshRegistrations}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompetitionRegistration;