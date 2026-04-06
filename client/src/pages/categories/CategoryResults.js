import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Tooltip, Divider, IconButton, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import MuiButton from '@mui/material/Button';
import { FaTags } from 'react-icons/fa';
import { ExpandMore as ExpandMoreIcon, EmojiEvents as EmojiEventsIcon, ArrowBack, NavigateNext as NavigateNextIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { getAtletiResults, getClubResults, getClubMedalsDetails } from '../../api/results';
import { printResults, printClubResults } from '../../api/results';
import { getCategoriesResult } from '../../api/results';
import { getCompetitionDetails } from '../../api/competitions';
import PageHeader from '../../components/PageHeader';
import Tabs from '../../components/common/Tabs';
import SearchTextField from '../../components/SearchTextField';
import muiTheme from '../../styles/muiTheme';
import DrawerModal from '../../components/common/DrawerModal';

const CategoryResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const competitionId = query.get('competizioneId');

  const [activeTab, setActiveTab] = useState("categoryResults");
  const [categoriesResult, setCategoriesResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [atleti, setAtleti] = useState(null);
  const [club, setClub] = useState(null);
  const [clubDetails, setClubDetails] = useState({});
  const [bestByFascia, setBestByFascia] = useState(null);
  const [categorySearchFilter, setCategorySearchFilter] = useState('');
  const [athleteSearchFilter, setAthleteSearchFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [drawerBestByAgeOpen, setDrawerBestByAgeOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [clubDrawerOpen, setClubDrawerOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const navigate = useNavigate();

  // Configurazione dei tabs
  const resultTabs = [
    { label: 'Classifiche', value: 'categoryResults', disabled: false },
    { label: 'Miglior atleta per fascia', value: 'athleteResults', disabled: false },
    { label: 'Miglior club per medaglie', value: 'clubResults', disabled: false }
  ];

  // Carica tutti i dati all'apertura della pagina
  useEffect(() => {
    let cancelled = false;
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [atletiRes, clubRes, loadedCompetition, catsResult] = await Promise.all([
          getAtletiResults(competitionId),
          getClubResults(competitionId),
          getCompetitionDetails(competitionId),
          getCategoriesResult(competitionId),
        ]);

        if (cancelled) return;

        setAtleti(atletiRes.atleti);
        setClub(clubRes);
        setBestByFascia(atletiRes.miglioriPerFasce);
        setCompetition(loadedCompetition);
        setCategoriesResult(catsResult);
        setLoading(false);
      } catch (err) {
        console.error('Errore risultati:', err);
        if (!cancelled) {
          setError('Errore caricamento risultati');
          setLoading(false);
        }
      }
    };
    fetchAllData();
    return () => { cancelled = true; };
  }, [competitionId]);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    navigate('/categories');
  };

  const handleClubDrawerOpen = useCallback(async (clubId) => {
    setSelectedClubId(clubId);
    setClubDrawerOpen(true);
    if (!clubDetails[clubId]) {
      const details = await getClubMedalsDetails(clubId, competitionId);
      setClubDetails(prev => ({ ...prev, [clubId]: details }));
    }
  }, [clubDetails, competitionId]);

  const handleClubFilterChange = (value) => {
    setClubFilter(value || '');
  };

  // --- Tab 1: Classifiche - columns & rows ---
  const categoryResultsColumns = useMemo(() => [
    { field: 'nomeCategoria', headerName: 'Nome Categoria', flex: 1, minWidth: 180 },
    { field: 'oro', headerName: 'Medaglia d\'oro 🥇', flex: 1, minWidth: 180, renderCell: (params) => <span style={{ whiteSpace: 'pre-line' }}>{params.value}</span> },
    { field: 'argento', headerName: 'Medaglia d\'argento 🥈', flex: 1, minWidth: 180, renderCell: (params) => <span style={{ whiteSpace: 'pre-line' }}>{params.value}</span> },
    { field: 'bronzo', headerName: 'Medaglia di bronzo 🥉', flex: 1, minWidth: 180, renderCell: (params) => <span style={{ whiteSpace: 'pre-line' }}>{params.value}</span> },
  ], []);

  const categoryResultsRows = useMemo(() => {
    const getDisplay = (entry) => {
      if (!entry?.nomeAtleta) return '-';
      return `${entry.nomeAtleta} - ${entry.club || '-'}`;
    };

    const allRows = categoriesResult.map(cat => {
      const classifica = cat.classifica || [];
      const oroEntry = classifica.find(x => x.pos === 1);
      const argEntry = classifica.find(x => x.pos === 2);
      const bronziEntries = classifica.filter(x => x.pos === 3);
      const bronzo = bronziEntries.length === 0 ? '-'
        : bronziEntries.length === 1 ? getDisplay(bronziEntries[0])
        : bronziEntries.map(getDisplay).join(' / ');
      return {
        id: cat.id,
        nomeCategoria: cat.nome,
        oro: getDisplay(oroEntry),
        argento: getDisplay(argEntry),
        bronzo,
      };
    });

    if (!categorySearchFilter) return allRows;
    const search = categorySearchFilter.toLowerCase();
    return allRows.filter(row =>
      row.nomeCategoria?.toLowerCase().includes(search) ||
      row.oro?.toLowerCase().includes(search) ||
      row.argento?.toLowerCase().includes(search) ||
      row.bronzo?.toLowerCase().includes(search)
    );
  }, [categoriesResult, categorySearchFilter]);

  // --- Tab 2: Atleti - columns & rows ---
  const athleteResultsColumns = useMemo(() => [
    { field: 'atleta', headerName: 'Atleta', flex: 1, minWidth: 140 },
    { field: 'clubDisplay', headerName: 'Club', flex: 1, minWidth: 120 },
    { field: 'sesso', headerName: 'Sesso', flex: 0.5, minWidth: 80 },
    { field: 'tipoAtleta', headerName: 'Tipo Atleta', flex: 1, minWidth: 120 },
    { field: 'fasciaEtaDisplay', headerName: 'Fascia Età', flex: 1, minWidth: 120 },
    { field: 'note', headerName: 'Note', flex: 1, minWidth: 200 },
    { field: 'punti', headerName: 'Punteggio', flex: 0.7, minWidth: 90, type: 'number', sortable: true },
    { field: 'oro', headerName: '🥇', flex: 0.5, minWidth: 60, type: 'number', sortable: true },
    { field: 'argento', headerName: '🥈', flex: 0.5, minWidth: 60, type: 'number', sortable: true },
    { field: 'bronzo', headerName: '🥉', flex: 0.5, minWidth: 60, type: 'number', sortable: true },
  ], []);

  const athleteResultsRows = useMemo(() => {
    if (!atleti) return [];
    const allRows = atleti.map(a => ({
      ...a,
      id: a.atletaId,
      atleta: `${a.cognome} ${a.nome}`,
      clubDisplay: a.clubAbbr || a.club,
      fasciaEtaDisplay: a.fasciaEta === 'Non Definita' && a.fasciaEtaNote
        ? `${a.fasciaEta} (${a.fasciaEtaNote})`
        : a.fasciaEta,
      note: a.fasciaEtaNote,
      oro: a.medaglie?.oro || 0,
      argento: a.medaglie?.argento || 0,
      bronzo: a.medaglie?.bronzo || 0,
    }));

    if (!athleteSearchFilter) return allRows;
    const search = athleteSearchFilter.toLowerCase();
    return allRows.filter(row =>
      row.atleta?.toLowerCase().includes(search) ||
      row.clubDisplay?.toLowerCase().includes(search)
    );
  }, [atleti, athleteSearchFilter]);

  // --- Drawer data per fascia di età ---
  const drawerBestByAgeData = useMemo(() => {
    if (!selectedTipo || !bestByFascia || !bestByFascia[selectedTipo]) return null;
    const fasce = bestByFascia[selectedTipo];
    const showSummary = selectedTipo !== 'CB Bambini';
    let bestOverall = [];
    if (showSummary) {
      let allAtleti = [];
      Object.values(fasce).forEach(sesso => {
        allAtleti = allAtleti.concat(sesso.M || [], sesso.F || []);
      });
      allAtleti = allAtleti.filter(Boolean);
      if (allAtleti.length > 0) {
        const maxPunti = Math.max(...allAtleti.map(a => a.punti));
        bestOverall = allAtleti.filter(a => a.punti === maxPunti);
      }
    }
    return { fasce, showSummary, bestOverall };
  }, [selectedTipo, bestByFascia]);

  // --- Tab 3: Club - columns & rows ---
  const clubResultsColumns = useMemo(() => [
    { field: 'club', headerName: 'Club', flex: 1, minWidth: 180 },
    { field: 'ori', headerName: '🥇', flex: 0.5, minWidth: 60, type: 'number', sortable: true },
    { field: 'argenti', headerName: '🥈', flex: 0.5, minWidth: 60, type: 'number', sortable: true },
    { field: 'bronzi', headerName: '🥉', flex: 0.5, minWidth: 60, type: 'number', sortable: true },
    { field: 'totaleMedaglie', headerName: 'Totale Medaglie', flex: 0.7, minWidth: 120, type: 'number', sortable: true },
    {
      field: 'dettagli',
      headerName: 'Dettagli',
      flex: 0.4,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleClubDrawerOpen(params.row.clubId)}
          title="Vedi atleti medagliati"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ], [handleClubDrawerOpen]);

  const clubNames = useMemo(() => {
    if (!club?.classifica) return [];
    return club.classifica.map(c => c.club).sort((a, b) => a.localeCompare(b));
  }, [club]);

  const clubResultsRows = useMemo(() => {
    if (!club?.classifica) return [];
    let filtered = club.classifica;
    if (clubFilter) {
      filtered = filtered.filter(c => c.club === clubFilter);
    }
    return filtered.map(c => ({
      id: c.clubId,
      clubId: c.clubId,
      club: c.club,
      ori: c.ori,
      argenti: c.argenti,
      bronzi: c.bronzi,
      totaleMedaglie: c.ori + c.argenti + c.bronzi,
    }));
  }, [club, clubFilter]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTags}
        title="Risultati competizione"
        subtitle={`${competition?.nome} - ${competition?.luogo} - ${format(new Date(competition?.dataInizio), 'dd/MM/yyyy')} - ${format(new Date(competition?.dataFine), 'dd/MM/yyyy')}`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna alle Competizioni
      </MuiButton>
    
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs tabs={resultTabs} activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Tab Panel - Classifiche per categoria */}
        {activeTab === "categoryResults" && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
              <SearchTextField
                value={categorySearchFilter}
                onChange={(e) => setCategorySearchFilter(e.target.value)}
                placeholder="Filtra per atleta o nome categoria"
                sx={{
                  width: '100%',
                  maxWidth: '800px',
                  '& .MuiOutlinedInput-root': { height: '60px' }
                }}
              />
              <MuiButton
                variant="contained"
                color="primary"
                onClick={async () => {
                  try {
                    await printResults(competitionId);
                  } catch (err) {
                    alert('Errore durante la generazione del PDF delle classifiche');
                  }
                }}
              >
                Stampa Classifiche
              </MuiButton>
            </Box>
            <DataGrid
              rows={categoryResultsRows}
              columns={categoryResultsColumns}
              initialState={{
                ...muiTheme.components.MuiDataGrid.defaultProps.initialState,
                sorting: {
                  sortModel: [{ field: 'nomeCategoria', sort: 'asc' }],
                },
              }}
              disableColumnMenu={false}
              localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
            />
          </Box>
        )}

        {/* Tab Panel - Classifiche per atleta */}
        {activeTab === "athleteResults" && atleti && (
          <Box>
            {/* Selettori per tipologia atleta */}
            {!bestByFascia ? (
              <Typography>Caricamento...</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {Object.keys(bestByFascia).map(tipo => (
                  <Box
                    key={tipo}
                    onClick={() => { setSelectedTipo(tipo); setDrawerBestByAgeOpen(true); }}
                    sx={{
                      flex: '1 1 220px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'action.hover', boxShadow: 2 },
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{tipo}</Typography>
                    <NavigateNextIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                ))}
              </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
              <SearchTextField
                value={athleteSearchFilter}
                onChange={(e) => setAthleteSearchFilter(e.target.value)}
                placeholder="Filtra per atleta o club"
                sx={{
                  width: '100%',
                  maxWidth: '800px',
                  '& .MuiOutlinedInput-root': { height: '60px' }
                }}
              />
            </Box>

            <DataGrid
              rows={athleteResultsRows}
              columns={athleteResultsColumns}
              initialState={{
                ...muiTheme.components.MuiDataGrid.defaultProps.initialState,
                sorting: {
                  sortModel: [{ field: 'punti', sort: 'desc' }],
                },
              }}
              disableColumnMenu={false}
              localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
            />

            {/* Drawer per fascia di età */}
            <DrawerModal
              open={drawerBestByAgeOpen}
              onClose={() => setDrawerBestByAgeOpen(false)}
              title={`Migliori per Fascia di Età: ${selectedTipo || ''}`}
            >
              {drawerBestByAgeData && (
                <Box>
                  {/* Miglior atleta assoluto */}
                  {drawerBestByAgeData.showSummary && drawerBestByAgeData.bestOverall.length > 0 && (
                    <Box sx={{ mb: 3, p: 2.5, bgcolor: '#eef2ff', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                        Miglior atleta assoluto
                      </Typography>
                      {drawerBestByAgeData.bestOverall.map((a, idx) => (
                        <Box key={a.atletaId}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {a.cognome} {a.nome} – {a.club}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1, flexWrap: 'wrap' }}>
                            {[['🥇', a.medaglie.oro], ['🥈', a.medaglie.argento], ['🥉', a.medaglie.bronzo]].map(([medal, count]) => (
                              <Box key={medal} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, border: '1px solid #d0d0d0', borderRadius: 1 }}>
                                <span>{medal}</span>
                                <Typography sx={{ fontWeight: 600 }}>{count}</Typography>
                              </Box>
                            ))}
                            <Typography sx={{ fontWeight: 700 }}>Punti: {a.punti}</Typography>
                          </Box>
                          {idx < drawerBestByAgeData.bestOverall.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Sezioni per fascia */}
                  {Object.entries(drawerBestByAgeData.fasce).map(([fascia, sesso]) => (
                    <Accordion key={fascia} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{fascia}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {/* Maschile */}
                          <Box sx={{ flex: '1 1 200px' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                              Maschile
                            </Typography>
                            {(sesso.M || []).length > 0 ? (
                              (sesso.M || []).map(a => (
                                <Box key={a.atletaId} sx={{ mb: 1.5 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {a.cognome} {a.nome} – {a.club}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                    {[['🥇', a.medaglie.oro], ['🥈', a.medaglie.argento], ['🥉', a.medaglie.bronzo]].map(([medal, count]) => (
                                      <Box key={medal} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, border: '1px solid #d0d0d0', borderRadius: 1 }}>
                                        <span>{medal}</span>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{count}</Typography>
                                      </Box>
                                    ))}
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Punti: {a.punti}</Typography>
                                  </Box>
                                </Box>
                              ))
                            ) : (
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Nessun atleta</Typography>
                            )}
                          </Box>

                          <Divider orientation="vertical" flexItem />

                          {/* Femminile */}
                          <Box sx={{ flex: '1 1 200px' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                              Femminile
                            </Typography>
                            {(sesso.F || []).length > 0 ? (
                              (sesso.F || []).map(a => (
                                <Box key={a.atletaId} sx={{ mb: 1.5 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {a.cognome} {a.nome} – {a.club}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                    {[['🥇', a.medaglie.oro], ['🥈', a.medaglie.argento], ['🥉', a.medaglie.bronzo]].map(([medal, count]) => (
                                      <Box key={medal} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, border: '1px solid #d0d0d0', borderRadius: 1 }}>
                                        <span>{medal}</span>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{count}</Typography>
                                      </Box>
                                    ))}
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Punti: {a.punti}</Typography>
                                  </Box>
                                </Box>
                              ))
                            ) : (
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Nessuna atleta</Typography>
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </DrawerModal>
          </Box>
        )}

        {/* Tab Panel - Classifiche per club */}
        {activeTab === "clubResults" && club && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3, mb: 5 }}>
              {club.podio.map((c, idx) => {
                const podiumStyles = [
                  { bg: 'linear-gradient(135deg, #FFF9E6 0%, #FFF3CC 100%)', icon: '#FFD700' },
                  { bg: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)', icon: '#A0A0A0' },
                  { bg: 'linear-gradient(135deg, #FFF5EB 0%, #FDEBD0 100%)', icon: '#CD7F32' },
                ];
                const style = podiumStyles[idx] || podiumStyles[2];
                return (
                  <Paper
                    key={c.clubId}
                    elevation={idx === 0 ? 6 : 3}
                    sx={{
                      p: 1.5,
                      width: 320,
                      minHeight: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      background: style.bg,
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <EmojiEventsIcon sx={{ fontSize: 36, color: style.icon, flexShrink: 0 }} />
                      <Tooltip title={c.club} arrow disableHoverListener={c.club.length <= 30}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3,
                          }}
                        >
                          {c.club}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        fontSize: '1.3rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>🥇 {c.ori}</span>
                      <span>🥈 {c.argenti}</span>
                      <span>🥉 {c.bronzi}</span>
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
              <Autocomplete
                id="club-filter-results"
                value={clubFilter || null}
                options={clubNames}
                groupBy={(option) => option.charAt(0).toUpperCase()}
                getOptionLabel={(option) => option}
                onChange={(event, value) => handleClubFilterChange(value)}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Club"
                    size="small"
                  />
                )}
                sx={{ minWidth: 200, maxWidth: 400, flexGrow: 1 }}
              />
              <MuiButton
                variant="contained"
                color="primary"
                onClick={async () => {
                  try {
                    await printClubResults(competitionId);
                  } catch (err) {
                    alert('Errore durante la generazione del PDF delle classifiche');
                  }
                }}
              >
                Stampa Classifiche Club
              </MuiButton>
            </Box>

            <DataGrid
              rows={clubResultsRows}
              columns={clubResultsColumns}
              initialState={{
                ...muiTheme.components.MuiDataGrid.defaultProps.initialState,
                sorting: {
                  sortModel: [{ field: 'ori', sort: 'desc' }],
                },
              }}
              disableColumnMenu={false}
              localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
            />

            {/* Drawer dettaglio atleti club */}
            <DrawerModal
              open={clubDrawerOpen}
              onClose={() => setClubDrawerOpen(false)}
              title={`Dettaglio medaglie – ${club?.classifica?.find(c => c.clubId === selectedClubId)?.club || ''}`}
            >
              {selectedClubId && (
                clubDetails[selectedClubId]?.atleti ? (
                  clubDetails[selectedClubId].atleti.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Atleta</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Ori</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Argenti</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Bronzi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...clubDetails[selectedClubId].atleti]
                          .sort((a, b) => b.ori - a.ori || b.argenti - a.argenti || b.bronzi - a.bronzi)
                          .map(a => (
                            <TableRow key={a.atletaId}>
                              <TableCell>{a.cognome} {a.nome}</TableCell>
                              <TableCell align="center" sx={{ letterSpacing: '0.1em' }}>{'🥇'.repeat(a.ori)}</TableCell>
                              <TableCell align="center" sx={{ letterSpacing: '0.1em' }}>{'🥈'.repeat(a.argenti)}</TableCell>
                              <TableCell align="center" sx={{ letterSpacing: '0.1em' }}>{'🥉'.repeat(a.bronzi)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, color: 'text.secondary' }}>Nessun atleta con medaglie</Typography>
                  )
                ) : (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                )
              )}
            </DrawerModal>
          </Box>
        )}
      </Tabs>

    </div>
  );
};

export default CategoryResults;
