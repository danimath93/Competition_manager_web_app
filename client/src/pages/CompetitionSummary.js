import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Euro as EuroIcon,
  Download as DownloadIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { getCompetitionDetails, getCompetitionCostSummary } from '../api/competitions';
import {
  getClubRegistrationsByCompetition,
  loadRegistrationsByCompetition,
  downloadClubRegistrationDocument,
} from '../api/registrations';

const CompetitionSummary = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [clubRegistrations, setClubRegistrations] = useState([]);
  const [athleteRegistrations, setAthleteRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAthletes, setExpandedAthletes] = useState({});
  const [expandedClubs, setExpandedClubs] = useState({});
  const [clubCostSummaries, setClubCostSummaries] = useState({});
  const [loadingCosts, setLoadingCosts] = useState({});

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  // Carica i costSummary di tutti i club quando si apre il tab Riepilogo Generale
  useEffect(() => {
    if (activeTab === 0 && clubRegistrations.length > 0) {
      const missingClubIds = clubRegistrations
        .map((clubReg) => clubReg.clubId)
        .filter((clubId) => !clubCostSummaries[clubId]);
      if (missingClubIds.length > 0) {
        missingClubIds.forEach((clubId) => {
          loadClubCostSummary(clubId);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, clubRegistrations]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carica i dettagli della competizione
      const competitionData = await getCompetitionDetails(competitionId);
      setCompetition(competitionData);

      // Carica le iscrizioni dei club
      const clubRegs = await getClubRegistrationsByCompetition(competitionId);
      setClubRegistrations(clubRegs);

      // Carica tutte le iscrizioni degli atleti
      const athleteRegs = await loadRegistrationsByCompetition(competitionId);
      setAthleteRegistrations(athleteRegs);

    } catch (err) {
      console.error('Errore nel caricamento dei dati:', err);
      setError('Errore nel caricamento dei dati della competizione');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/competitions');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleToggleAthlete = (athleteId) => {
    setExpandedAthletes((prev) => ({
      ...prev,
      [athleteId]: !prev[athleteId],
    }));
  };

  const handleToggleClub = (clubId) => {
    setExpandedClubs((prev) => ({
      ...prev,
      [clubId]: !prev[clubId],
    }));

    // Carica i dettagli dei costi quando si espande
    if (!expandedClubs[clubId] && !clubCostSummaries[clubId] && !loadingCosts[clubId]) {
      loadClubCostSummary(clubId);
    }
  };

  const loadClubCostSummary = async (clubId) => {
    if (clubCostSummaries[clubId]) return; // Già caricato

    setLoadingCosts((prev) => ({ ...prev, [clubId]: true }));
    try {
      const summary = await getCompetitionCostSummary(clubId, competitionId);
      setClubCostSummaries((prev) => ({ ...prev, [clubId]: summary }));
    } catch (err) {
      console.error('Errore nel caricamento del riepilogo costi:', err);
    } finally {
      setLoadingCosts((prev) => ({ ...prev, [clubId]: false }));
    }
  };

  const handleDownloadDocument = async (clubId, documentType, fileName) => {
    try {
      const blob = await downloadClubRegistrationDocument(clubId, competitionId, documentType);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `${documentType}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore nel download del documento:', err);
      alert('Errore nel download del documento');
    }
  };

  // Raggruppa gli atleti per club
  const athletesByClub = athleteRegistrations.reduce((acc, reg) => {
    const clubId = reg.atleta?.club?.id;
    const clubName = reg.atleta?.club?.denominazione || 'Sconosciuto';

    if (!acc[clubId]) {
      acc[clubId] = {
        clubName,
        athletes: {},
      };
    }

    const athleteId = reg.atleta?.id;
    if (!acc[clubId].athletes[athleteId]) {
      acc[clubId].athletes[athleteId] = {
        ...reg.atleta,
        registrations: [],
      };
    }

    acc[clubId].athletes[athleteId].registrations.push(reg);
    return acc;
  }, {});

  // Calcola il costo iscrizione di un atleta
  const getRegistrationCosts = (registrations) => {
    if (!registrations || registrations.length === 0) {
      return 'N/A';
    }
    if (registrations.length > 0) {
      let totalCost = 0;
      totalCost = registrations[0].costoIscrizione;
      return totalCost;
    }

    return 'N/A';
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
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mt: 2 }}>
          Torna alle Competizioni
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 2 }}>
          Torna alle Competizioni
        </Button>

        <Typography variant="h4" gutterBottom>
          Riepilogo Iscrizioni
        </Typography>

        {competition && (
          <Typography variant="h6" color="text.secondary">
            {competition.nome} - {competition.luogo}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Riepilogo generale" />
          <Tab label="Dettagli per Club" />
          <Tab label="Atleti" />
        </Tabs>
      </Paper>

      {/* Tab Panel - Riepilogo generale */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Riepilogo Generale
          </Typography>

          {clubRegistrations.length === 0 ? (
            <Alert severity="info">Nessun club iscritto a questa competizione</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nome Club</strong></TableCell>
                    <TableCell align="center"><strong>CB Bambini</strong></TableCell>
                    <TableCell align="center"><strong>CB Adulti</strong></TableCell>
                    <TableCell align="center"><strong>CN</strong></TableCell>
                    <TableCell align="center"><strong>Totale iscritti</strong></TableCell>
                    <TableCell align="right"><strong>Quota dovuta (€)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clubRegistrations.map((clubReg) => {
                    const clubId = clubReg.clubId;
                    const costSummary = clubCostSummaries[clubId];

                    // Ricava i conteggi per tipo atleta
                    const cbBambini = costSummary?.athleteTypeTotals?.['CB Bambini']?.total || 0;
                    const cbAdulti = costSummary?.athleteTypeTotals?.['CB Adulti']?.total || 0;
                    const cn = costSummary?.athleteTypeTotals?.['CN']?.total || 0;
                    const totale = cbBambini + cbAdulti + cn;
                    const quota = costSummary?.totals?.totalCost?.toFixed(2) || '0.00';

                    return (
                      <TableRow key={clubId}>
                        <TableCell>{clubReg.club?.denominazione || 'N/A'}</TableCell>
                        <TableCell align="center">{cbBambini}</TableCell>
                        <TableCell align="center">{cbAdulti}</TableCell>
                        <TableCell align="center">{cn}</TableCell>
                        <TableCell align="center">{totale}</TableCell>
                        <TableCell align="right">{quota}</TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Riga dei totali */}
                  <TableRow sx={{ borderTop: '3px solid #d8240cff' }}>
                    <TableCell><strong>Totale</strong></TableCell>
                    <TableCell align="center">
                      <strong>
                        {clubRegistrations.reduce((sum, clubReg) => {
                          const clubId = clubReg.clubId;
                          const costSummary = clubCostSummaries[clubId];
                          return sum + (costSummary?.athleteTypeTotals?.['CB Bambini']?.total || 0);
                        }, 0)}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        {clubRegistrations.reduce((sum, clubReg) => {
                          const clubId = clubReg.clubId;
                          const costSummary = clubCostSummaries[clubId];
                          return sum + (costSummary?.athleteTypeTotals?.['CB Adulti']?.total || 0);
                        }, 0)}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        {clubRegistrations.reduce((sum, clubReg) => {
                          const clubId = clubReg.clubId;
                          const costSummary = clubCostSummaries[clubId];
                          return sum + (costSummary?.athleteTypeTotals?.['CN']?.total || 0);
                        }, 0)}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        {clubRegistrations.reduce((sum, clubReg) => {
                          const clubId = clubReg.clubId;
                          const costSummary = clubCostSummaries[clubId];
                          const cbBambini = costSummary?.athleteTypeTotals?.['CB Bambini']?.total || 0;
                          const cbAdulti = costSummary?.athleteTypeTotals?.['CB Adulti']?.total || 0;
                          const cn = costSummary?.athleteTypeTotals?.['CN']?.total || 0;
                          return sum + cbBambini + cbAdulti + cn;
                        }, 0)}
                      </strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>
                        {clubRegistrations.reduce((sum, clubReg) => {
                          const clubId = clubReg.clubId;
                          const costSummary = clubCostSummaries[clubId];
                          return sum + (costSummary?.totals?.totalCost || 0);
                        }, 0).toFixed(2)}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab Panel - Club */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Club Iscritti
          </Typography>

          {clubRegistrations.length === 0 ? (
            <Alert severity="info">Nessun club iscritto a questa competizione</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="50"></TableCell>
                    <TableCell><strong>Club</strong></TableCell>
                    <TableCell><strong>Stato</strong></TableCell>
                    <TableCell><strong>Data Iscrizione</strong></TableCell>
                    <TableCell><strong>Data Conferma</strong></TableCell>
                    <TableCell align="center"><strong>Atleti</strong></TableCell>
                    <TableCell align="center"><strong>Categorie</strong></TableCell>
                    <TableCell align="right"><strong>Costo Totale</strong></TableCell>
                    <TableCell align="center"><strong>Documenti</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clubRegistrations.map((clubReg) => {
                    const clubId = clubReg.clubId;
                    const costSummary = clubCostSummaries[clubId];
                    const loadingCost = loadingCosts[clubId];

                    return (
                      <React.Fragment key={clubReg.id}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleClub(clubId)}
                            >
                              {expandedClubs[clubId] ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>{clubReg.club?.denominazione || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={clubReg.stato}
                              color={
                                clubReg.stato === 'Confermata'
                                  ? 'success'
                                  : clubReg.stato === 'In attesa'
                                    ? 'warning'
                                    : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {clubReg.dataIscrizione
                              ? new Date(clubReg.dataIscrizione).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {clubReg.dataConferma
                              ? new Date(clubReg.dataConferma).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {loadingCost ? (
                              <CircularProgress size={20} />
                            ) : (
                              costSummary?.totals?.totalAthletes || '-'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {loadingCost ? (
                              <CircularProgress size={20} />
                            ) : (
                              costSummary?.totals?.totalCategories || '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {loadingCost ? (
                              <CircularProgress size={20} />
                            ) : costSummary && costSummary?.totals?.totalCost ? (
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                <EuroIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {costSummary.totals.totalCost.toFixed(2)}
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              {clubReg.certificatiMediciNome && (
                                <Tooltip title="Scarica Certificati Medici">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDownloadDocument(
                                        clubId,
                                        'certificatiMedici',
                                        clubReg.certificatiMediciNome
                                      )
                                    }
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {clubReg.autorizzazioniNome && (
                                <Tooltip title="Scarica Autorizzazioni">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDownloadDocument(
                                        clubId,
                                        'autorizzazioni',
                                        clubReg.autorizzazioniNome
                                      )
                                    }
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {clubReg.confermaPresidenteNome && (
                                <Tooltip title="Scarica Conferma Presidente">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDownloadDocument(
                                        clubId,
                                        'confermaPresidente',
                                        clubReg.confermaPresidenteNome
                                      )
                                    }
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {!clubReg.certificatiMediciNome &&
                                !clubReg.autorizzazioniNome &&
                                !clubReg.confermaPresidenteNome && '-'}
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Riga espandibile con i dettagli del club */}
                        <TableRow>
                          <TableCell colSpan={9} sx={{ py: 0, borderBottom: 'none' }}>
                            <Collapse
                              in={expandedClubs[clubId]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                  Dettaglio Iscrizioni - {clubReg.club?.denominazione}
                                </Typography>

                                {loadingCost ? (
                                  <Box display="flex" justifyContent="center" p={2}>
                                    <CircularProgress />
                                  </Box>
                                ) : costSummary ? (
                                  <>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                      Totale atleti: <strong>{costSummary.totals.totalAthletes}</strong> |
                                      Totale categorie: <strong>{costSummary.totals.totalCategories}</strong>
                                    </Typography>

                                    {costSummary.athleteTypeTotals &&
                                      Object.entries(costSummary.athleteTypeTotals).length > 0 ? (
                                      <Table size="small" sx={{ bgcolor: 'white' }}>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell><strong>Tipo Atleta</strong></TableCell>
                                            <TableCell align="center"><strong>Totale</strong></TableCell>
                                            <TableCell align="center"><strong>1 Categoria</strong></TableCell>
                                            <TableCell align="center"><strong>2+ Categorie</strong></TableCell>
                                            <TableCell align="right"><strong>Costo Tipo</strong></TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {Object.entries(costSummary.athleteTypeTotals).map(
                                            ([type, detail]) => (
                                              <TableRow key={type}>
                                                <TableCell>{type}</TableCell>
                                                <TableCell align="center">{detail.total}</TableCell>
                                                <TableCell align="center">{detail.singleCategory}</TableCell>
                                                <TableCell align="center">{detail.multiCategory}</TableCell>
                                                <TableCell align="right">
                                                  <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="flex-end"
                                                  >
                                                    <EuroIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                    {detail.totalCost?.toFixed(2) || '0.00'}
                                                  </Box>
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                          <TableRow>
                                            <TableCell colSpan={4} align="right">
                                              <strong>Totale Complessivo:</strong>
                                            </TableCell>
                                            <TableCell align="right">
                                              <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="flex-end"
                                              >
                                                <EuroIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                <strong>{costSummary.totals?.totalCost?.toFixed(2)}</strong>
                                              </Box>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        Nessun dettaglio disponibile per tipo atleta
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Dati non disponibili
                                  </Typography>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab Panel - Atleti */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Atleti Iscritti
          </Typography>

          {Object.keys(athletesByClub).length === 0 ? (
            <Alert severity="info">Nessun atleta iscritto a questa competizione</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="50"></TableCell>
                    <TableCell><strong>Club</strong></TableCell>
                    <TableCell><strong>Cognome</strong></TableCell>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>Data di Nascita</strong></TableCell>
                    <TableCell><strong>Tipologia</strong></TableCell>
                    <TableCell align="center"><strong>N° Categorie</strong></TableCell>
                    <TableCell align="center"><strong>Costo</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(athletesByClub)
                    .sort(([, a], [, b]) => a.clubName.localeCompare(b.clubName))
                    .map(([clubId, clubData]) =>
                      Object.values(clubData.athletes)
                        .sort((a, b) => {
                          const lastNameCompare = (a.cognome || '').localeCompare(
                            b.cognome || ''
                          );
                          if (lastNameCompare !== 0) return lastNameCompare;
                          return (a.nome || '').localeCompare(b.nome || '');
                        })
                        .map((athlete) => (
                          <React.Fragment key={athlete.id}>
                            <TableRow hover>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleAthlete(athlete.id)}
                                >
                                  {expandedAthletes[athlete.id] ? (
                                    <ExpandLess />
                                  ) : (
                                    <ExpandMore />
                                  )}
                                </IconButton>
                              </TableCell>
                              <TableCell>{clubData.clubName}</TableCell>
                              <TableCell>{athlete.cognome}</TableCell>
                              <TableCell>{athlete.nome}</TableCell>
                              <TableCell>
                                {athlete.dataNascita
                                  ? new Date(athlete.dataNascita).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>{athlete.tipoAtleta?.nome || 'N/A'}</TableCell>
                              <TableCell align="center">
                                {athlete.registrations.length}
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="flex-end"
                                >
                                  {getRegistrationCosts(athlete.registrations)}
                                  <EuroIcon
                                    fontSize="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>

                            {/* Riga espandibile con le categorie */}
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                sx={{ py: 0, borderBottom: 'none' }}
                              >
                                <Collapse
                                  in={expandedAthletes[athlete.id]}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Box sx={{ margin: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Categorie di iscrizione:
                                    </Typography>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Categoria</TableCell>
                                          <TableCell>Tipo Competizione</TableCell>
                                          <TableCell>Esperienza</TableCell>
                                          <TableCell>Peso</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {athlete.registrations.map((reg) => (
                                          <TableRow key={reg.id}>
                                            <TableCell>
                                              {reg.tipoCategoria?.nome || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                              {reg.tipoCategoria?.tipoCompetizione?.nome ||
                                                'N/A'}
                                            </TableCell>
                                            <TableCell>
                                              {reg.esperienza?.nome || '-'}
                                            </TableCell>
                                            <TableCell>
                                              {reg.peso ? `${reg.peso} kg` : '-'}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default CompetitionSummary;
