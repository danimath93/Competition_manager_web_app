import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  Container,
  CircularProgress,
  Chip,
} from '@mui/material';
import MuiButton from '@mui/material/Button';
import { ArrowBack, Euro as EuroIcon } from '@mui/icons-material';
import { FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCompetitionDetails } from '../../api/competitions';
import { loadAthletesByClub } from '../../api/athletes';
import {
  loadAthleteRegistrationsByCompetitionAndClub,
  createOrGetClubRegistration,
  getClubRegistration,
  editClubRegistration,
  getClubRegistrationCosts,
  deleteAthleteRegistrations,
  downloadClubRegistrationSummary
} from '../../api/registrations';
import ClubAthletesList from '../../components/ClubAthletesList';
import RegisteredAthletesTable from '../../components/RegisteredAthletesTable';
import CompetitionFinalization from './CompetitionFinalization';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/common/Button';
import { ConfirmActionModal } from '../../components/common';

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
  const [isFinalizationDrawerOpen, setIsFinalizationDrawerOpen] = useState(false);
  const [isDownloadSummaryModalOpen, setIsDownloadSummaryModalOpen] = useState(false);
  const [totalCost, setTotalCost] = useState(null);
  const [costLoading, setCostLoading] = useState(false);

  const handleGoBack = () => {
    navigate('/competitions');
  };

  const handleEditAthlete = () => {
    refreshClubAthletes();
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

  const handleDeleteAthleteRegistration = async (athlete, registrations) => {
    try {
      setLoading(true);

      // Rimuovi l'atleta dalle iscrizioni
      await deleteAthleteRegistrations(athlete.id, competitionId);

      // Ricarica le iscrizioni
      await refreshRegistrations();
    } catch (err) {
      setError('Errore durante la rimozione dell\'atleta: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aprire il drawer di finalizzazione
  const handleOpenFinalizationDrawer = async () => {
    setIsFinalizationDrawerOpen(true);
  };

  // Funzione per chiudere il drawer di finalizzazione
  const handleCloseFinalizationDrawer = () => {
    setIsFinalizationDrawerOpen(false);
  };

  // Funzione chiamata dopo il successo della finalizzazione
  const handleFinalizationSuccess = async () => {
    setIsFinalizationDrawerOpen(false);
    setIsDownloadSummaryModalOpen(true);

    await refreshClubRegistration();
    await refreshRegistrations();
  };

  // Funzione per gestire il download del riepilogo iscrizione del club
  const handleDownloadClubRegistrationSummary = async () => {
    await downloadRegistrationPDF();
  };

  // Funzione per aggiornare la lista degli atleti iscritti
  const refreshRegistrations = async () => {
    try {
      const registrationsData = await loadAthleteRegistrationsByCompetitionAndClub(
        competitionId,
        user.clubId
      );
      setRegisteredAthletes(registrationsData);

      if (clubRegistration == null) {
        const newClubReg = await createOrGetClubRegistration(user.clubId, competitionId);
        setClubRegistration(newClubReg);
        setIsClubRegistered(false);
      }

      // Aggiorna anche i costi
      await refreshCosts();
    } catch (err) {
      console.error('Errore nel ricaricamento delle iscrizioni:', err);
    }
  };

  // Funzione per aggiornare i costi
  const refreshCosts = async () => {
    if (!user?.clubId || !competitionId) return;

    try {
      setCostLoading(true);
      const costsData = await getClubRegistrationCosts(user.clubId, competitionId);
      setTotalCost(costsData.totalCost);
    } catch (err) {
      console.error('Errore nel caricamento dei costi:', err);
      setTotalCost(null);
    } finally {
      setCostLoading(false);
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

  const canConfirmRegistration = () => {
    return registeredAthletes.length > 0 && !isClubRegistered;
  };

    // Funzione per scaricare il PDF di riepilogo dal backend
  const downloadRegistrationPDF = async () => {
    try {
      await downloadClubRegistrationSummary(user.clubId, competitionId);
    } catch (err) {
      console.error('Errore durante il download del PDF:', err);
      setError('Errore durante il download del PDF: ' + err.message);
    }
  };

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

          await refreshCosts();
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
        <MuiButton
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna alle Competizioni
        </MuiButton>
      </Container>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title="Competizioni"
        subtitle={`Iscrizione alla competizione: ${competition ? competition.nome : ''}${competition && competition.luogo ? ` - ${competition.luogo}` : ''}`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Torna alle Competizioni
      </MuiButton>

      {/* Contenuto della pagina */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 210px)' }}>
        <div className={isClubRegistered ? "page-grid-full" : "page-grid-25-75"}>
          {!isClubRegistered && (
            <div className="page-card-with-external-title">
              <h2 className="page-card-external-title">Atleti del Club</h2>
              <div className="page-card-scrollable">
                <div className="page-card-scrollable-body">
                  <ClubAthletesList
                    athletes={clubAthletes}
                    competition={competition}
                    isClubRegistered={isClubRegistered}
                    onEditAthlete={handleEditAthlete}
                    onRegistrationSuccess={refreshRegistrations}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="page-card-with-external-title">
            <h2 className="page-card-external-title">Atleti Iscritti alla Gara</h2>
            <div className="page-card-scrollable">
              <div className="page-card-scrollable-body" style={{ padding: '0' }}>
                <RegisteredAthletesTable
                  registrations={registeredAthletes}
                  competition={competition}
                  isClubRegistered={isClubRegistered}
                  onDeleteAthlete={handleDeleteAthleteRegistration}
                  onRegistrationChange={refreshRegistrations}
                />
              </div>
            </div>
            {/* Bottoni in basso a destra */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mt: 4,
                flexShrink: 0
              }}
            >
              {/* Costi totali */}
              <Box display="flex" alignItems="center" gap={1}>
                {costLoading ? (
                  <CircularProgress size={20} />
                ) : totalCost !== null && (
                  <>
                    <Chip
                      icon={<EuroIcon />}
                      label={`Totale: ${totalCost.toFixed(2)} €`}
                      color="info"
                      size="large"
                      sx={{ fontSize: '1rem', py: 2.5, px: 1 }}
                    />
                  </>
                )}
              </Box>

              {/* Bottoni azioni */}
              <Box display="flex" gap={2}>
                {/* Bottone finalizza iscrizione - visibile solo se atleti iscritti */}
                {!isClubRegistered && (
                  <Button
                    variant='success'
                    onClick={handleOpenFinalizationDrawer}
                    disabled={!canConfirmRegistration()}
                  >
                    Finalizza Iscrizione
                  </Button>
                )}

                {/* Iscrizione confermata */}
                {isClubRegistered && (
                  <Box display="flex" alignItems="center" gap={3}>
                    <Alert severity="success" sx={{ mb: 0 }}>
                      Iscrizione confermata il {clubRegistration?.dataConferma ? new Date(clubRegistration.dataConferma).toLocaleDateString() : ''}
                    </Alert>
                    <Button
                      onClick={handleEditRegistration()}
                    >
                      Modifica Iscrizione
                    </Button>
                    <Button
                      variant='info'
                      onClick={handleDownloadClubRegistrationSummary}
                    >
                      Riepilogo Iscrizione
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Drawer per finalizzazione iscrizione */}
            <CompetitionFinalization
              open={isFinalizationDrawerOpen}
              onClose={handleCloseFinalizationDrawer}
              clubRegistration={clubRegistration}
              competitionId={competitionId}
              totalCost={totalCost}
              onFinalizationSuccess={handleFinalizationSuccess}
            />
            </div>
        </div>
      </div>

      <Box sx={{ mb: 2, flexShrink: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <ConfirmActionModal 
        title="Iscrizione Confermata"
        message="L'iscrizione del club a questa competizione è stata confermata con successo, scaricare il riepilogo dell'iscrizione effettuata?"
        open={isDownloadSummaryModalOpen}
        onClose={() => setIsDownloadSummaryModalOpen(false)}
        primaryButton={{
          text: 'Scarica',
          onClick: async () => { await handleDownloadClubRegistrationSummary(); setIsDownloadSummaryModalOpen(false); },
        }}
        secondaryButton={{
          text: 'Chiudi',
          onClick: () => setIsDownloadSummaryModalOpen(false),
        }}
      />
    </div>
  );
};

export default CompetitionRegistration;