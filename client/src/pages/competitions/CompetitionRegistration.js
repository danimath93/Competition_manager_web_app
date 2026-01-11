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
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { ArrowBack, Euro as EuroIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCompetitionDetails } from '../../api/competitions';
import { loadAthletesByClub } from '../../api/athletes';
import { getCompetitionCostSummary } from '../../api/competitions';
import {
  loadAthleteRegistrationsByCompetitionAndClub,
  createOrGetClubRegistration,
  getClubRegistration,
  confirmClubRegistrationFinal,
  editClubRegistration,
  getClubRegistrationCosts,
  deleteAthleteRegistrations,
} from '../../api/registrations';
import ClubAthletesList from '../../components/ClubAthletesList';
import RegisteredAthletesTable from '../../components/RegisteredAthletesTable';
import RegistrationDocumentsUploadModal from '../../components/RegistrationDocumentsUploadModal';
import PageHeader from '../../components/PageHeader';

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
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [totalCost, setTotalCost] = useState(null);
  const [costLoading, setCostLoading] = useState(false);

  // Stato per la card riepilogo costi
  const [showCostSummary, setShowCostSummary] = useState(false);
  const [costSummary, setCostSummary] = useState(null);
  const [costSummaryLoading, setCostSummaryLoading] = useState(false);
  const [costSummaryError, setCostSummaryError] = useState(null);
  const [ibanCopied, setIbanCopied] = useState(false);

  // Funzione per aprire la card riepilogo costi
  const handleOpenCostSummary = async () => {
    setShowCostSummary(true);
    setCostSummaryLoading(true);
    setCostSummaryError(null);
    try {
      const summary = await getCompetitionCostSummary(user.clubId, competitionId);
      setCostSummary(summary);
    } catch (err) {
      setCostSummaryError('Errore nel caricamento del riepilogo costi');
      setCostSummary(null);
    } finally {
      setCostSummaryLoading(false);
    }
  };

  // Funzione per chiudere la card riepilogo costi
  const handleCloseCostSummary = () => {
    setShowCostSummary(false);
    setCostSummary(null);
    setCostSummaryError(null);
    setIbanCopied(false);
  };

  // Funzione per copiare l'IBAN negli appunti
  const handleCopyIban = async () => {
    if (costSummary?.versamento?.iban) {
      try {
        await navigator.clipboard.writeText(costSummary.versamento.iban);
        setIbanCopied(true);
        setTimeout(() => setIbanCopied(false), 2000);
      } catch (err) {
        console.error('Errore durante la copia dell\'IBAN:', err);
      }
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
    return clubRegistration?.confermaPresidenteNome;
  };

  const canConfirmRegistration = () => {
    return registeredAthletes.length > 0 && areDocumentsUploaded() && !isClubRegistered;
  };

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
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title="Competizioni"
        subtitle={`Iscrizione alla competizione: ${competition ? competition.nome : ''}${competition && competition.luogo ? ` - ${competition.luogo}` : ''}`}
      />
      <Button
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Torna alle Competizioni
      </Button>

      {/* Contenuto della pagina */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
        <div className="page-grid-25-75">
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
          <div className="page-card-with-external-title">
            <h2 className="page-card-external-title">Atleti Iscritti alla Gara</h2>
            <RegisteredAthletesTable
              registrations={registeredAthletes}
              competition={competition}
              isClubRegistered={isClubRegistered}
              onDeleteAthlete={handleDeleteAthleteRegistration}
              onRegistrationChange={refreshRegistrations}
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

      {/* Bottoni in basso a destra */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mt: 2,
          pt: 2,
          borderTop: '1px solid #e0e0e0',
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
                color="primary"
                size="large"
                sx={{ fontSize: '1rem', py: 2.5, px: 1 }}
              />
            </>
          )}
        </Box>

        {/* Bottoni azioni */}
        <Box display="flex" gap={2}>
          {/* Stato "In attesa" - mostra bottone documenti */}
          {registeredAthletes?.length > 0 && clubRegistration?.stato === 'In attesa' && (
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
              <Button
                variant="outlined"
                color="info"
                size="large"
                sx={{ ml: 1 }}
                onClick={handleOpenCostSummary}
              >
                FINALIZZA ISCRIZIONE
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Modale per upload documenti */}
      <RegistrationDocumentsUploadModal
        open={isDocumentsModalOpen}
        onClose={handleCloseDocumentsModal}
        clubRegistration={clubRegistration}
      />

      {/* Card riepilogo costi */}
      {showCostSummary && (
        <>
          {/* Overlay per chiusura clic esterno */}
          <Box onClick={handleCloseCostSummary} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1299, background: 'transparent' }} />
          <Box sx={{ position: 'fixed', top: 80, right: 40, zIndex: 1300, width: 420 }}>
            <Paper elevation={6} sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Riepilogo costi iscrizione</Typography>
                <Button size="small" color="error" onClick={handleCloseCostSummary}>Chiudi</Button>
              </Box>
              {costSummaryLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : costSummaryError ? (
                <Alert severity="error">{costSummaryError}</Alert>
              ) : costSummary ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    In totale hai iscritto <strong>{costSummary?.totals?.totalAthletes}</strong> atleti alla competizione per un totale di <strong>{costSummary?.totals?.totalCategories}</strong> categorie.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Di seguito i dettagli:
                  </Typography>
                  {/* Dettaglio per tipo atleta */}
                  {costSummary?.athleteTypeTotals && Object.entries(costSummary?.athleteTypeTotals).map(([type, detail]) => (
                    <Box key={type} sx={{ mb: 1, ml: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        • <strong>{detail.total}</strong> {type} iscritti alla gara, di cui
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        - {detail.singleCategory} iscritti ad una sola categoria
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        - {detail.multiCategory} iscritti a 2 o più categorie
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    L'IBAN sul quale versare il pagamento della competizione è il seguente:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                      {costSummary?.versamento?.iban || 'Non disponibile'}
                    </Typography>
                    {costSummary?.versamento?.iban && (
                      <Tooltip title="Iban copiato correttamente sulla clipboard!" open={ibanCopied} arrow>
                        <Button
                          size="small"
                          onClick={handleCopyIban}
                          sx={{ minWidth: 'auto', flexShrink: 0 }}
                        >
                          <CopyIcon />
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Intestatario da inserire:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                      {costSummary?.versamento?.intestatario || 'Non disponibile'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Causale da inserire:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                      {costSummary?.versamento?.causale || 'Non disponibile'}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Costo totale:</strong> {(costSummary.totalCost != null ? costSummary.totalCost : totalCost)?.toFixed(2)} €
                  </Typography>
                </>
              ) : null}
            </Paper>
          </Box>
        </>
      )}
    </div>
  );
};

export default CompetitionRegistration;