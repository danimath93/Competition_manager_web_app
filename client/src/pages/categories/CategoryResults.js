import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Tooltip } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import MuiButton from '@mui/material/Button';
import { FaTags } from 'react-icons/fa';
import { ExpandMore as ExpandMoreIcon, EmojiEvents as EmojiEventsIcon, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import { getAtletiResults, getClubResults, getClubMedalsDetails } from '../../api/results';
import { printResults, printClubResults } from '../../api/results';
import { getCategoriesByCompetizione, getCategoryExecution } from '../../api/categories';
import { getCompetitionDetails } from '../../api/competitions';
import PageHeader from '../../components/PageHeader';
import Tabs from '../../components/common/Tabs';
import SearchTextField from '../../components/SearchTextField';
import muiTheme from '../../styles/muiTheme';

// non serve più ma teniamola al momento
function MedalIcons({ ori, argenti, bronzi }) {
  return <span>{'🥇'.repeat(ori)}{'🥈'.repeat(argenti)}{'🥉'.repeat(bronzi)}</span>;
}

const CategoryResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const competitionId = query.get('competizioneId');

  const [activeTab, setActiveTab] = useState("categoryResults");
  const [categories, setCategories] = useState([]);
  const [categoryExecutions, setCategoryExecutions] = useState({});
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);
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
        setCatLoading(true);
        setCatError(null);

        const [atletiRes, clubRes, loadedCompetition, cats] = await Promise.all([
          getAtletiResults(competitionId),
          getClubResults(competitionId),
          getCompetitionDetails(competitionId),
          getCategoriesByCompetizione(competitionId),
        ]);

        if (cancelled) return;

        setAtleti(atletiRes.atleti);
        setClub(clubRes);
        setBestByFascia(atletiRes.miglioriPerFasce);
        setCompetition(loadedCompetition);
        setCategories(cats);

        // Carica le execution delle categorie in parallelo
        const executions = {};
        await Promise.all(
          cats.map(async cat => {
            try {
              const exec = await getCategoryExecution(cat.id);
              executions[cat.id] = exec;
            } catch (e) {
              executions[cat.id] = null;
            }
          })
        );
        if (!cancelled) {
          setCategoryExecutions(executions);
          setCatLoading(false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Errore risultati:', err);
        if (!cancelled) {
          setError('Errore caricamento risultati');
          setCatError('Errore caricamento classifiche categorie');
          setLoading(false);
          setCatLoading(false);
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

  const handleAccordion = useCallback(async (clubId) => {
    if (clubDetails[clubId]) return;
    const details = await getClubMedalsDetails(clubId, competitionId);
    setClubDetails(prev => ({ ...prev, [clubId]: details }));
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
    const atletiList = atleti || [];
    const getAtletaDisplay = (atletaId) => {
      const atleta = atletiList.find(a => a.atletaId === atletaId || a.id === atletaId);
      if (!atleta) return '-';
      const clubName = atleta.clubAbbr || atleta.club || atleta.clubDenominazione || atleta.clubNome || '-';
      return `${atleta.nome} ${atleta.cognome} - ${clubName}`;
    };

    const allRows = categories.map(cat => {
      const exec = categoryExecutions[cat.id];
      let oro = '-';
      let argento = '-';
      let bronzo = '-';
      if (exec?.classifica && Array.isArray(exec.classifica)) {
        const oroObj = exec.classifica.find(x => x.pos === 1);
        const argObj = exec.classifica.find(x => x.pos === 2);
        const bronziObj = exec.classifica.filter(x => x.pos === 3);
        oro = oroObj ? getAtletaDisplay(oroObj.atletaId) : '-';
        argento = argObj ? getAtletaDisplay(argObj.atletaId) : '-';
        if (bronziObj.length === 1) {
          bronzo = getAtletaDisplay(bronziObj[0].atletaId);
        } else if (bronziObj.length > 1) {
          bronzo = bronziObj.map(b => getAtletaDisplay(b.atletaId)).join(' / ');
        }
      }
      return { id: cat.id, nomeCategoria: cat.nome, oro, argento, bronzo };
    });

    if (!categorySearchFilter) return allRows;
    const search = categorySearchFilter.toLowerCase();
    return allRows.filter(row =>
      row.nomeCategoria?.toLowerCase().includes(search) ||
      row.oro?.toLowerCase().includes(search) ||
      row.argento?.toLowerCase().includes(search) ||
      row.bronzo?.toLowerCase().includes(search)
    );
  }, [categories, categoryExecutions, atleti, categorySearchFilter]);

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
      atleta: `${a.nome} ${a.cognome}`,
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
      flex: 1.5,
      minWidth: 250,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Accordion onChange={() => handleAccordion(params.row.clubId)} sx={{ width: '100%', boxShadow: 'none' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Dettagli medaglie
          </AccordionSummary>
          <AccordionDetails>
            {clubDetails[params.row.clubId]?.atleti ? (
              clubDetails[params.row.clubId].atleti.length > 0 ? (
                clubDetails[params.row.clubId].atleti.map(a => (
                  <Box key={a.atletaId} sx={{ mb: 1 }}>
                    <b>{a.nome} {a.cognome}</b>:{' '}
                    <MedalIcons ori={a.ori} argenti={a.argenti} bronzi={a.bronzi} />
                  </Box>
                ))
              ) : (
                <Typography>Nessun atleta con medaglie</Typography>
              )
            ) : (
              <CircularProgress size={20} />
            )}
          </AccordionDetails>
        </Accordion>
      ),
    },
  ], [clubDetails, handleAccordion]);

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
        subtitle={`${competition?.nome} - ${competition?.luogo} - ${format(new Date(competition.dataInizio), 'dd/MM/yyyy')} - ${format(new Date(competition.dataFine), 'dd/MM/yyyy')}`}
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
            {catLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : catError ? (
              <Alert severity="error">{catError}</Alert>
            ) : (
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
            )}
          </Box>
        )}

        {/* Tab Panel - Classifiche per atleta */}
        {activeTab === "athleteResults" && atleti && (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Migliori per Fascia di Età
              </Typography>

              {!bestByFascia ? (
                <Typography>Caricamento...</Typography>
              ) : (
                Object.entries(bestByFascia).map(([tipo, fasce]) => {
                  let showSummary = tipo !== 'CB Bambini';
                  let bestOverall = [];
                  if (showSummary) {
                    let allAtleti = [];
                    Object.values(fasce).forEach(sesso => {
                      allAtleti = allAtleti.concat(sesso.M, sesso.F);
                    });
                    allAtleti = allAtleti.filter(Boolean);
                    if (allAtleti.length > 0) {
                      const maxPunti = Math.max(...allAtleti.map(a => a.punti));
                      bestOverall = allAtleti.filter(a => a.punti === maxPunti);
                    }
                  }
                  return (
                    <Box key={tipo} sx={{ mb: 2 }}>
                      <Accordion sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">{tipo}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {showSummary && bestOverall.length > 0 && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Miglior atleta assoluto</Typography>
                              {bestOverall.map(a => (
                                <Box key={a.atletaId} sx={{ ml: 1, mb: 1 }}>
                                  <b>{a.nome} {a.cognome}</b> – {a.club}
                                  <Box sx={{ ml: 1 }}>
                                    🥇{a.medaglie.oro} 🥈{a.medaglie.argento} 🥉{a.medaglie.bronzo}
                                  </Box>
                                  <Typography>Punti: {a.punti}</Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                          {Object.entries(fasce).map(([fascia, sesso]) => (
                            <Accordion key={fascia} sx={{ mb: 1, ml: 2 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{fascia}</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="subtitle1">Maschile</Typography>
                                {sesso.M.length > 0 ? (
                                  sesso.M.map(a => (
                                    <Box key={a.atletaId} sx={{ ml: 2, mb: 1 }}>
                                      <b>{a.nome} {a.cognome}</b> – {a.club}
                                      <Box sx={{ ml: 1 }}>
                                        🥇{a.medaglie.oro} 🥈{a.medaglie.argento} 🥉{a.medaglie.bronzo}
                                      </Box>
                                      <Typography>Punti: {a.punti}</Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography sx={{ ml: 2, color: "gray" }}>Nessun atleta</Typography>
                                )}
                                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                  Femminile
                                </Typography>
                                {sesso.F.length > 0 ? (
                                  sesso.F.map(a => (
                                    <Box key={a.atletaId} sx={{ ml: 2, mb: 1 }}>
                                      <b>{a.nome} {a.cognome}</b> – {a.club}
                                      <Box sx={{ ml: 1 }}>
                                        🥇{a.medaglie.oro} 🥈{a.medaglie.argento} 🥉{a.medaglie.bronzo}
                                      </Box>
                                      <Typography>Punti: {a.punti}</Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography sx={{ ml: 2, color: "gray" }}>Nessuna atleta</Typography>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  );
                })
              )}
            </Box>

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
              getRowHeight={() => 'auto'}
            />
          </Box>
        )}
      </Tabs>

    </div>
  );
};

export default CategoryResults;
