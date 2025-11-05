import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCompetitionDetails } from '../api/competitions';
import { loadAthletesByClub, createAthlete, updateAthlete } from '../api/athletes';
import { loadRegistrationsByCompetitionAndClub, confirmClubRegistration, editClubRegistration } from '../api/registrations';
import ClubAthletesList from '../components/ClubAthletesList';
import RegisteredAthletesList from '../components/RegisteredAthletesList';
import AthleteModal from '../components/AthleteModal';
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
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

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

  // Funzione per aggiornare la lista degli atleti del club
  const refreshClubAthletes = async () => {
    try {
      const athletesData = await loadAthletesByClub(user.clubId);
      setClubAthletes(athletesData);
    } catch (err) {
      console.error('Errore nel ricaricamento degli atleti:', err);
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

  const handleOpenAthleteModal = (athlete = null) => {
    setIsEditMode(!!athlete);
    setSelectedAthlete(athlete);
    setIsAthleteModalOpen(true);
  };

  const handleCloseAthleteModal = () => {
    setIsAthleteModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleSaveAthlete = async (athleteData) => {
    try {
      if (isEditMode) {
        await updateAthlete(athleteData.id, athleteData);
      } else {
        await createAthlete(athleteData);
      }
      await refreshClubAthletes();
    } catch (error) {
      console.error("Errore nel salvataggio dell'atleta:", error);
      setError("Errore nel salvataggio dell'atleta");
    } finally {
      handleCloseAthleteModal();
    }
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
    <Container 
      maxWidth={false} 
      sx={{ 
        height: 'calc(100vh - 100px)', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        px: 2
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mb: 1 }}
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

      <Box sx={{ mb: 2, flexShrink: 0 }}>
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

      {/* Layout a due colonne con flexbox */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3, 
          flexGrow: 1,
          overflow: 'auto',
          minHeight: 0
        }}
      >
        {/* Colonna sinistra - Atleti del club */}
        <Box sx={{ 
          minWidth: 400, 
          flex: '0 0 400px',
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexShrink: 0
            }}>
              <Typography variant="h6">
                Atleti del Club
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleOpenAthleteModal()}
              >
                +
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <ClubAthletesList
                athletes={clubAthletes}
                competition={competition}
                isClubRegistered={isClubRegistered}
                onRegistrationSuccess={refreshRegistrations}
                onEditAthlete={handleOpenAthleteModal}
              />
            </Box>
          </Paper>
        </Box>

        {/* Colonna destra - Atleti iscritti */}
        <Box sx={{ 
          flexGrow: 1,
          minWidth: 600,
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            overflow: 'hidden'
          }}>
            <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
              Atleti Iscritti alla Gara
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <RegisteredAthletesList
                registrations={registeredAthletes}
                competition={competition}
                isClubRegistered={isClubRegistered}
                onRegistrationChange={refreshRegistrations}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Modale per aggiungere/modificare atleta */}
      {isAthleteModalOpen && (
        <AthleteModal
          open={isAthleteModalOpen}
          onClose={handleCloseAthleteModal}
          onSubmit={handleSaveAthlete}
          isEditMode={isEditMode}
          athlete={selectedAthlete}
        />
      )}
    </Container>
  );
};

export default CompetitionRegistration;