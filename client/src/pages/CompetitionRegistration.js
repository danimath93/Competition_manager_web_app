import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCompetitionDetails } from '../api/competitions';
import { loadAthletesByClub, createAthlete, updateAthlete } from '../api/athletes';
import { 
  loadAthleteRegistrationsByCompetitionAndClub, 
  createOrGetClubRegistration,
  getClubRegistration,
  uploadClubRegistrationDocuments,
  confirmClubRegistrationFinal,
  editClubRegistration,
} from '../api/registrations';
import ClubAthletesList from '../components/ClubAthletesList';
import RegisteredAthletesList from '../components/RegisteredAthletesList';
import AthleteModal from '../components/AthleteModal';
import RegistrationDocumentsUploadModal from '../components/RegistrationDocumentsUploadModal';

const CompetitionRegistration = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [competition, setCompetition] = useState(null);
  const [clubAthletes, setClubAthletes] = useState([]);
  const [registeredAthletes, setRegisteredAthletes] = useState([]);
  const [isClubRegistered, setIsClubRegistered] = useState(false);
  const [clubRegistration, setClubRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

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
        const registrationsData = await loadAthleteRegistrationsByCompetitionAndClub(
          competitionId,
          user.clubId
        );
        setRegisteredAthletes(registrationsData);

        // Carica o crea l'iscrizione del club
        try {
          const clubRegData = await getClubRegistration(user.clubId, competitionId);
          setClubRegistration(clubRegData);
          setIsClubRegistered(clubRegData.stato === 'Confermata');
        } catch (err) {
          // L'iscrizione non esiste ancora - creala se ci sono atleti iscritti
          if (registrationsData.length > 0) {
            try {
              const newClubReg = await createOrGetClubRegistration(user.clubId, competitionId);
              setClubRegistration(newClubReg);
              setIsClubRegistered(false);
            } catch (createErr) {
              console.error('Errore nella creazione iscrizione club:', createErr);
              setClubRegistration(null);
              setIsClubRegistered(false);
            }
          } else {
            setClubRegistration(null);
            setIsClubRegistered(false);
          }
        }

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
    if (clubRegistration) {
      setIsClubRegistered(clubRegistration.stato === 'Confermata');
    }
  }, [clubRegistration]);

  // Funzione per aggiornare la lista degli atleti iscritti
  const refreshRegistrations = async () => {
    try {
      const registrationsData = await loadAthleteRegistrationsByCompetitionAndClub(
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

  // Funzione per aggiornare lo stato dell'iscrizione del club
  const refreshClubRegistration = async () => {
    try {
      const clubRegData = await getClubRegistration(user.clubId, competitionId);
      setClubRegistration(clubRegData);
      setIsClubRegistered(clubRegData.stato === 'Confermata');
    } catch (err) {
      console.error('Errore nel ricaricamento dell\'iscrizione del club:', err);
    }
  };

  const handleOpenDocumentsModal = async () => {
    try {
      // Crea o recupera l'iscrizione del club
      const clubRegData = await createOrGetClubRegistration(user.clubId, competitionId);
      setClubRegistration(clubRegData);
      setIsDocumentsModalOpen(true);
    } catch (err) {
      console.error('Errore durante l\'apertura del modal documenti:', err);
    }
  };

  const handleCloseDocumentsModal = () => {
    refreshClubRegistration();
    setIsDocumentsModalOpen(false);
  };

  const handleConfirmRegistration = async () => {
    try {
      setLoading(true);
      
      // Conferma iscrizione
      await confirmClubRegistrationFinal(user.clubId, competitionId);

      // Ricarica i dati
      const clubRegData = await getClubRegistration(user.clubId, competitionId);
      setClubRegistration(clubRegData);
      
      await refreshRegistrations();

      setError(null);
    } catch (err) {
      console.error('Errore durante la conferma dell\'iscrizione:', err);
      setError('Errore durante la conferma dell\'iscrizione: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const areDocumentsUploaded = () => {
    return clubRegistration?.certificatiMediciNome && clubRegistration?.autorizzazioniNome;
  };

  const canConfirmRegistration = () => {
    return registeredAthletes.length > 0 && areDocumentsUploaded() && !isClubRegistered;
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

  const handleEditRegistration = () => {
    return async () => {
      try {
        await editClubRegistration(user.clubId, competitionId);
        const competitionData = await getCompetitionDetails(competitionId);
        setCompetition(competitionData);
        
        // Ricarica anche l'iscrizione del club
        try {
          const clubRegData = await getClubRegistration(user.clubId, competitionId);
          setClubRegistration(clubRegData);
        } catch (err) {
          setClubRegistration(null);
        }
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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

      {/* Bottoni in basso a destra */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          gap: 2,
          mt: 2,
          pt: 2,
          borderTop: '1px solid #e0e0e0',
          flexShrink: 0
        }}
      >
        {/* Stato "In attesa" - mostra bottone documenti */}
        {clubRegistration?.stato === 'In attesa' && (
          <>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleOpenDocumentsModal}
            >
              {areDocumentsUploaded() ? 'Modifica Documenti' : 'Carica Documenti'}
            </Button>
            
            {areDocumentsUploaded() && (
              <Alert severity="success" sx={{ mb: 0 }}>
                ✓ Documenti caricati
              </Alert>
            )}
          </>
        )}

        {/* Bottone conferma iscrizione - visibile solo se documenti caricati e atleti iscritti */}
        {!isClubRegistered && (
          <>
            {registeredAthletes.length === 0 && (
              <Alert severity="info" sx={{ mb: 0 }}>
                Aggiungi almeno un atleta per poter confermare l'iscrizione
              </Alert>
            )}
            
            {registeredAthletes.length > 0 && !areDocumentsUploaded() && (
              <Alert severity="warning" sx={{ mb: 0 }}>
                Carica i documenti obbligatori per confermare l'iscrizione
              </Alert>
            )}

            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleConfirmRegistration}
              disabled={!canConfirmRegistration()}
            >
              Conferma Iscrizione
            </Button>
          </>
        )}

        {/* Iscrizione confermata */}
        {isClubRegistered && (
          <Box display="flex" alignItems="center" gap={2}>
            <Alert severity="success" sx={{ mb: 0 }}>
              Iscrizione confermata il {clubRegistration?.dataConferma ? new Date(clubRegistration.dataConferma).toLocaleDateString() : ''}
            </Alert>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleEditRegistration()}
            >
              Modifica Iscrizione
            </Button>
          </Box>
        )}
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

      {/* Modale per upload documenti */}
      <RegistrationDocumentsUploadModal
        open={isDocumentsModalOpen}
        onClose={handleCloseDocumentsModal}
        clubRegistration={clubRegistration}
      />
    </Container>
  );
};

export default CompetitionRegistration;