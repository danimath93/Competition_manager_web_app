import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert } from '@mui/material';
import MuiButton from '@mui/material/Button';
import { FaTags } from 'react-icons/fa';
import { ExpandMore as ExpandMoreIcon, EmojiEvents as EmojiEventsIcon, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import { getAtletiResults, getClubResults, getClubMedalsDetails } from '../../api/results';
import { printResults } from '../../api/resultsPrint';
import { getCompetitionDetails } from '../../api/competitions';
import PageHeader from '../../components/PageHeader';

// non serve più ma teniamola al momento
function MedalIcons({ ori, argenti, bronzi }) {
  return <span>{'🥇'.repeat(ori)}{'🥈'.repeat(argenti)}{'🥉'.repeat(bronzi)}</span>;
}

const CategoryResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const competitionId = query.get('competizioneId');


  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [atleti, setAtleti] = useState(null);
  const [club, setClub] = useState(null);
  const [clubDetails, setClubDetails] = useState({});
  const [bestByFascia, setBestByFascia] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  let cancelled = false;
  const fetchData = async () => {
    try {
      setLoading(true);
      const atletiRes = await getAtletiResults(competitionId);
      const clubRes = await getClubResults(competitionId);
      const loadedCompetition = await getCompetitionDetails(competitionId);

      if (cancelled) return;

      const listaAtleti = atletiRes.atleti;
      setAtleti(listaAtleti);
      setClub(clubRes);
      setBestByFascia(atletiRes.miglioriPerFasce);
      setCompetition(loadedCompetition);
      setLoading(false);
    } catch (err) {
      console.error('Errore risultati:', err);
      if (!cancelled) {
        setError('Errore caricamento risultati');
        setLoading(false);
      }
    }
  };

  fetchData();
  return () => { cancelled = true; };
}, [competitionId]);

  const handleTab = (e, v) => setTab(v);

  const handleGoBack = () => {
    navigate('/categories');
  };


  const handleAccordion = async (clubId) => {
    if (clubDetails[clubId]) return;
    const details = await getClubMedalsDetails(clubId, competitionId);
    setClubDetails(prev => ({ ...prev, [clubId]: details }));
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

      <Paper sx={{ mb: 4, mt: 2 }}>
        <Tabs value={tab} onChange={handleTab}>
          <Tab label="Miglior Atleta per Fascia" />
          <Tab label="Miglior Club per Medaglie" />
        </Tabs>
      </Paper>
        {tab === 0 && atleti && (
          <Box>
            {/* Pulsante stampa classifiche */}
            <MuiButton
              variant="contained"
              color="primary"
              sx={{ mb: 2 }}
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
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Migliori per Fascia di Età
              </Typography>

              {!bestByFascia ? (
                <Typography>Caricamento...</Typography>
              ) : (
                Object.entries(bestByFascia).map(([tipo, fasce]) => (
                  <Accordion key={tipo} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">{tipo}</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      {Object.entries(fasce).map(([fascia, sesso]) => (
                        <Accordion key={fascia} sx={{ mb: 1, ml: 2 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{fascia}</Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            {/* Maschi */}
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

                            {/* Femmine */}
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
                ))
              )}
            </Box>

            <Typography variant="h6" gutterBottom>Classifica completa medagliati</Typography>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Atleta</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>Punteggio</TableCell>
                    <TableCell>🥇</TableCell>
                    <TableCell>🥈</TableCell>
                    <TableCell>🥉</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...atleti]
                      .sort((a, b) => b.punti - a.punti)
                      .map(a => (
                    <TableRow key={a.atletaId}>
                      <TableCell>{a.nome} {a.cognome}</TableCell>
                      <TableCell>{a.clubAbbr || a.club}</TableCell>
                      <TableCell>{a.punti}</TableCell>
                      <TableCell>{a.medaglie.oro}</TableCell>
                      <TableCell>{a.medaglie.argento}</TableCell>
                      <TableCell>{a.medaglie.bronzo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
      )}

      {tab === 1 && club && (
        <Box>
          <Typography variant="h6" gutterBottom>Podio Club</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {club.podio.map((c, idx) => (
              <Paper key={c.clubId} sx={{ p: 2, minWidth: 200, bgcolor: idx === 0 ? 'gold.100' : undefined }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEventsIcon color={idx === 0 ? 'warning' : 'disabled'} />
                  <Typography variant="subtitle1">{c.club}</Typography>
                </Box>
                <Box
                  sx={{
                    ml: 1,
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    fontSize: "1.6rem"
                  }}
                >
                  <span>🥇 {c.ori}</span>
                  <span>🥈 {c.argenti}</span>
                  <span>🥉 {c.bronzi}</span>
                </Box>
              </Paper>
            ))}
          </Box>
          <Typography variant="h6" gutterBottom>Tutti i Club</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Club</TableCell>
                  <TableCell>🥇</TableCell>
                  <TableCell>🥈</TableCell>
                  <TableCell>🥉</TableCell>
                  <TableCell>Dettagli</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {club.classifica.map(c => (
                  <TableRow key={c.clubId}>
                    <TableCell>{c.club}</TableCell>
                    <TableCell>{c.ori}</TableCell>
                    <TableCell>{c.argenti}</TableCell>
                    <TableCell>{c.bronzi}</TableCell>
                    <TableCell>
                      <Accordion onChange={() => handleAccordion(c.clubId)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          Dettagli medaglie
                        </AccordionSummary>
                        <AccordionDetails>
                          {clubDetails[c.clubId] && clubDetails[c.clubId].atleti ? (
                              clubDetails[c.clubId].atleti.length > 0 ? (
                                  clubDetails[c.clubId].atleti.map(a => (
                                      <Box key={a.atletaId} sx={{ mb: 1 }}>
                                        <b>{a.nome} {a.cognome}</b>: 
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </div>
  );
};

export default CategoryResults;
