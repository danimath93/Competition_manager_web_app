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
  Divider,
} from '@mui/material';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import InfoIcon from '@mui/icons-material/Info';
import DrawerModal from '../components/common/DrawerModal';

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
  const [clubCostSummaries, setClubCostSummaries] = useState({});
  const [loadingCosts, setLoadingCosts] = useState({});
  const [athleteFilters, setAthleteFilters] = useState({ name: '', club: '' });
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubDetailsOpen, setClubDetailsOpen] = useState(false);

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

  const handleAthleteFilterChange = (e) => {
    setAthleteFilters({ ...athleteFilters, [e.target.name]: e.target.value });
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

  const handleOpenClubDetails = (club) => {
  setSelectedClub(club);
  setClubDetailsOpen(true);
};

const handleCloseClubDetails = () => {
  setSelectedClub(null);
  setClubDetailsOpen(false);
};

  // Raggruppa gli atleti per club
  let athletesByClub = athleteRegistrations.reduce((acc, reg) => {
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

  // Applica i filtri agli atleti
  if (athleteFilters.name || athleteFilters.club) {
    athletesByClub = Object.entries(athletesByClub).reduce((acc, [clubId, clubData]) => {
      if (athleteFilters.club && clubId !== athleteFilters.club.toString()) {
        return acc;
      }

      const filteredAthletes = Object.values(clubData.athletes).filter((athlete) => {
        if (athleteFilters.name) {
          const fullName = `${athlete.nome} ${athlete.cognome}`.toLowerCase();
          return fullName.includes(athleteFilters.name.toLowerCase());
        }
        return true;
      });

      if (filteredAthletes.length > 0) {
        acc[clubId] = {
          ...clubData,
          athletes: filteredAthletes.reduce((athletesAcc, athlete) => {
            athletesAcc[athlete.id] = athlete;
            return athletesAcc;
          }, {}),
        };
      }

      return acc;
    }, {});
  }

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
            <Box sx={{ width: '100%', height: 820, mt: 2 }}>
              <DataGrid
                rows={clubRegistrations.map((clubReg) => {
                  const clubId = clubReg.clubId;
                  const costSummary = clubCostSummaries[clubId];
                  const cbBambini = costSummary?.athleteTypeTotals?.['CB Bambini']?.total || 0;
                  const cbAdulti = costSummary?.athleteTypeTotals?.['CB Adulti']?.total || 0;
                  const cn = costSummary?.athleteTypeTotals?.['CN']?.total || 0;
                  const totale = cbBambini + cbAdulti + cn;
                  const quota = costSummary?.totals?.totalCost?.toFixed(2) || '0.00';
                  return {
                    id: clubId,
                    club: clubReg.club?.denominazione || 'N/A',
                    cbBambini,
                    cbAdulti,
                    cn,
                    totale,
                    quota,
                  };
                })}
                columns={[
                  { field: 'club', headerName: 'Nome Club', flex: 2, minWidth: 180 },
                  { field: 'cbBambini', headerName: 'CB Bambini', flex: 1, minWidth: 100, align: 'center', headerAlign: 'center', type: 'number' },
                  { field: 'cbAdulti', headerName: 'CB Adulti', flex: 1, minWidth: 100, align: 'center', headerAlign: 'center', type: 'number' },
                  { field: 'cn', headerName: 'CN', flex: 1, minWidth: 100, align: 'center', headerAlign: 'center', type: 'number' },
                  { field: 'totale', headerName: 'Totale iscritti', flex: 1, minWidth: 120, align: 'center', headerAlign: 'center', type: 'number' },
                  { field: 'quota', headerName: 'Quota dovuta (€)', flex: 1, minWidth: 120, align: 'right', headerAlign: 'right', type: 'number' },
                ]}
                initialState={{
                  sorting: { sortModel: [{ field: 'club', sort: 'asc' }] },
                }}
                disableRowSelectionOnClick
                disableColumnMenu={false}
                disableColumnSelector={true}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                  '& .MuiDataGrid-row:hover': { backgroundColor: 'var(--bg-secondary, #f8f9fa)' },
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'var(--bg-secondary, #f8f9fa)', fontWeight: 600 },
                }}
                slots={{
                  footer: () => {
                    // Riga dei totali custom
                    const totalCbBambini = clubRegistrations.reduce((sum, clubReg) => {
                      const clubId = clubReg.clubId;
                      const costSummary = clubCostSummaries[clubId];
                      return sum + (costSummary?.athleteTypeTotals?.['CB Bambini']?.total || 0);
                    }, 0);
                    const totalCbAdulti = clubRegistrations.reduce((sum, clubReg) => {
                      const clubId = clubReg.clubId;
                      const costSummary = clubCostSummaries[clubId];
                      return sum + (costSummary?.athleteTypeTotals?.['CB Adulti']?.total || 0);
                    }, 0);
                    const totalCn = clubRegistrations.reduce((sum, clubReg) => {
                      const clubId = clubReg.clubId;
                      const costSummary = clubCostSummaries[clubId];
                      return sum + (costSummary?.athleteTypeTotals?.['CN']?.total || 0);
                    }, 0);
                    const totalIscritti = clubRegistrations.reduce((sum, clubReg) => {
                      const clubId = clubReg.clubId;
                      const costSummary = clubCostSummaries[clubId];
                      const cbBambini = costSummary?.athleteTypeTotals?.['CB Bambini']?.total || 0;
                      const cbAdulti = costSummary?.athleteTypeTotals?.['CB Adulti']?.total || 0;
                      const cn = costSummary?.athleteTypeTotals?.['CN']?.total || 0;
                      return sum + cbBambini + cbAdulti + cn;
                    }, 0);
                    const totalQuota = clubRegistrations.reduce((sum, clubReg) => {
                      const clubId = clubReg.clubId;
                      const costSummary = clubCostSummaries[clubId];
                      return sum + (costSummary?.totals?.totalCost || 0);
                    }, 0);
                    return (
                      <Box sx={{ display: 'flex', width: '100%', borderTop: '3px solid #d8240cff', background: '#fafafa', fontWeight: 600, minHeight: 56 }}>
                        <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', pl: 2 }}>Totale</Box>
                        <Box sx={{ flex: 1, textAlign: 'center', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>{totalCbBambini}</Box>
                        <Box sx={{ flex: 1, textAlign: 'center', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>{totalCbAdulti}</Box>
                        <Box sx={{ flex: 1, textAlign: 'center', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>{totalCn}</Box>
                        <Box sx={{ flex: 1, textAlign: 'center', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>{totalIscritti}</Box>
                        <Box sx={{ flex: 1, textAlign: 'right', alignItems: 'center', display: 'flex', justifyContent: 'flex-end', pr: 2 }}>{totalQuota.toFixed(2)}</Box>
                      </Box>
                    );
                  }
                }}
              />
            </Box>
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
            <Alert severity="info">Nessun club iscritto a questa competizione.</Alert>
          ) : (
            <Box sx={{ width: '100%', height: 650, mt: 2 }}>
              <DataGrid
                rows={clubRegistrations.map((clubReg) => {
                  const clubId = clubReg.clubId;
                  const costSummary = clubCostSummaries[clubId];
                  const loadingCost = loadingCosts[clubId];

                  return {
                    id: clubId,
                    club: clubReg.club?.denominazione || 'N/A',
                    stato: clubReg.stato,
                    dataIscrizione: clubReg.dataIscrizione
                      ? new Date(clubReg.dataIscrizione).toLocaleDateString()
                      : 'N/A',
                    dataConferma: clubReg.dataConferma
                      ? new Date(clubReg.dataConferma).toLocaleDateString()
                      : '-',
                    atleti: loadingCost ? '-' : costSummary?.totals?.totalAthletes ?? '-',
                    categorie: loadingCost ? '-' : costSummary?.totals?.totalCategories ?? '-',
                    costo: loadingCost
                      ? '-'
                      : costSummary?.totals?.totalCost
                        ? costSummary.totals.totalCost.toFixed(2)
                        : '-',
                    // IMPORTANTISSIMO: manteniamo tutto l'oggetto
                    raw: clubReg,
                  };
                })}
                columns={[
                  {
                    field: 'club',
                    headerName: 'Club',
                    flex: 2,
                    minWidth: 180,
                  },
                  {
                    field: 'stato',
                    headerName: 'Stato',
                    flex: 1,
                    minWidth: 120,
                    renderCell: (params) => (
                      <Chip
                        label={params.value}
                        size="small"
                        color={
                          params.value === 'Confermata'
                            ? 'success'
                            : params.value === 'In attesa'
                              ? 'warning'
                              : 'default'
                        }
                      />
                    ),
                  },
                  {
                    field: 'dataIscrizione',
                    headerName: 'Data Iscrizione',
                    flex: 1,
                    minWidth: 130,
                  },
                  {
                    field: 'dataConferma',
                    headerName: 'Data Conferma',
                    flex: 1,
                    minWidth: 130,
                  },
                  {
                    field: 'atleti',
                    headerName: 'Atleti',
                    flex: 1,
                    minWidth: 100,
                    align: 'center',
                    headerAlign: 'center',
                  },
                  {
                    field: 'categorie',
                    headerName: 'Categorie',
                    flex: 1,
                    minWidth: 120,
                    align: 'center',
                    headerAlign: 'center',
                  },
                  {
                    field: 'costo',
                    headerName: 'Costo Totale (€)',
                    flex: 1,
                    minWidth: 140,
                    align: 'right',
                    headerAlign: 'right',
                    renderCell: (params) =>
                      params.value !== '-' ? (
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <EuroIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {params.value}
                        </Box>
                      ) : (
                        '-'
                      ),
                  },
                {
                  field: 'actions',
                  type: 'actions',
                  headerName: 'Azioni',
                  width: 80,
                  getActions: (params) => {
                    const actions = [
                      <GridActionsCellItem
                        key="details"
                        icon={<InfoIcon />}
                        label="Dettagli"
                        showInMenu
                        onClick={() => handleOpenClubDetails(params.row.raw)}
                      />,
                    ];

                    if (params.row.raw?.confermaPresidenteNome) {
                      actions.push(
                        <GridActionsCellItem
                          key="download-cp"
                          icon={<DownloadIcon />}
                          label="Scarica CP"
                          showInMenu
                          onClick={() =>
                            handleDownloadDocument(
                              params.row.raw.clubId,
                              'confermaPresidente',
                              params.row.raw.confermaPresidenteNome
                            )
                          }
                        />
                      );
                    }

                    return actions;
                  },
                }
                ]}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'club', sort: 'asc' }],
                  },
                }}
                disableRowSelectionOnClick
                disableColumnSelector
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'var(--bg-secondary, #f8f9fa)',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'var(--bg-secondary, #f8f9fa)',
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          )}
        </Paper>
      )}
      <DrawerModal
        open={clubDetailsOpen}
        onClose={handleCloseClubDetails}
        title={`Dettaglio Iscrizioni - ${selectedClub?.club?.denominazione || ''}`}
      >
        {selectedClub && (() => {
          const clubId = selectedClub.clubId;
          const loadingCost = loadingCosts[clubId];
          const costSummary = clubCostSummaries[clubId];

          return (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* ================= RIEPILOGO ================= */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box>
                  <strong>Club:</strong> {selectedClub.club?.denominazione || 'N/A'}
                </Box>

                <Box>
                  <strong>Stato iscrizione:</strong> {selectedClub.stato}
                </Box>

                <Box>
                  <strong>Data iscrizione:</strong>{' '}
                  {selectedClub.dataIscrizione
                    ? new Date(selectedClub.dataIscrizione).toLocaleDateString()
                    : 'N/A'}
                </Box>

                <Box>
                  <strong>Data conferma:</strong>{' '}
                  {selectedClub.dataConferma
                    ? new Date(selectedClub.dataConferma).toLocaleDateString()
                    : '-'}
                </Box>

                <Box>
                  <strong>Numero atleti:</strong>{' '}
                  {costSummary?.totals?.totalAthletes ?? '-'}
                </Box>

                <Box>
                  <strong>Numero categorie:</strong>{' '}
                  {costSummary?.totals?.totalCategories ?? '-'}
                </Box>

                <Box>
                  <strong>Quota totale:</strong>{' '}
                  {costSummary?.totals?.totalCost
                    ? `${costSummary.totals.totalCost.toFixed(2)} €`
                    : '-'}
                </Box>
              </Box>

              <Divider />

              {/* ================= DETTAGLIO PER TIPO ATLETA ================= */}
              {loadingCost ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : costSummary ? (
                costSummary.athleteTypeTotals &&
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
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Dati non disponibili
                </Typography>
              )}
            </Box>
          );
        })()}
      </DrawerModal>    

      {/* Tab Panel - Atleti */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Atleti Iscritti
          </Typography>

          {/* Filtri */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Filtra per Nome/Cognome"
                  variant="outlined"
                  sx={{ minWidth: 200 }}
                  fullWidth
                  value={athleteFilters.name}
                  onChange={handleAthleteFilterChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
                  <InputLabel>Filtra per Club</InputLabel>
                  <Select
                    name="club"
                    label="Filtra per Club"
                    value={athleteFilters.club}
                    onChange={handleAthleteFilterChange}
                  >
                    <MenuItem value="">
                      <em>Tutti</em>
                    </MenuItem>
                    {clubRegistrations.map((clubReg) => (
                      <MenuItem key={clubReg.clubId} value={clubReg.clubId}>
                        {clubReg.club?.denominazione || 'N/A'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          {Object.keys(athletesByClub).length === 0 ? (
            <Alert severity="info">Nessun atleta iscritto a questa competizione</Alert>
          ) : (
            <Box sx={{ width: '100%', height: 520, mt: 2 }}>
              <DataGrid
                rows={Object.entries(athletesByClub)
                  .sort(([, a], [, b]) => a.clubName.localeCompare(b.clubName))
                  .flatMap(([clubId, clubData]) =>
                    Object.values(clubData.athletes).map((athlete) => ({
                      id: athlete.id,
                      club: clubData.clubName,
                      cognome: athlete.cognome,
                      nome: athlete.nome,
                      dataNascita: athlete.dataNascita,
                      tipoAtleta: athlete.tipoAtleta?.nome || 'N/A',
                      nCategorie: athlete.registrations.length,
                      costo: getRegistrationCosts(athlete.registrations),
                    }))
                  )
                }
                columns={[
                  { field: 'club', headerName: 'Club', flex: 2, minWidth: 150 },
                  { field: 'cognome', headerName: 'Cognome', flex: 1, minWidth: 120 },
                  { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 120 },
                  { field: 'dataNascita', headerName: 'Data di Nascita', flex: 1, minWidth: 130, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' },
                  { field: 'tipoAtleta', headerName: 'Tipologia', flex: 1, minWidth: 120 },
                  { field: 'nCategorie', headerName: 'N° Categorie', flex: 1, minWidth: 100, align: 'center', headerAlign: 'center', type: 'number' },
                  { field: 'costo', headerName: 'Costo', flex: 1, minWidth: 100, align: 'right', headerAlign: 'right', renderCell: (params) => (
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {params.value}
                        <EuroIcon fontSize="small" sx={{ ml: 1 }} />
                      </Box>
                    ) },
                ]}
                initialState={{
                  sorting: { sortModel: [{ field: 'cognome', sort: 'asc' }] },
                }}
                disableRowSelectionOnClick
                disableColumnMenu={false}
                disableColumnSelector={true}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                  '& .MuiDataGrid-row:hover': { backgroundColor: 'var(--bg-secondary, #f8f9fa)' },
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'var(--bg-secondary, #f8f9fa)', fontWeight: 600 },
                }}
              />
            </Box>)}
        </Paper>
      )}
    </Container>

    
  );
};

export default CompetitionSummary;
