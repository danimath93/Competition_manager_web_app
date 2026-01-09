import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getAtletiResults, getClubResults, getClubMedalsDetails } from '../../api/results';
import { ArrowBack } from '@mui/icons-material';
const medalEmoji = {
  oro: '🥇',
  argento: '🥈',
  bronzo: '🥉'
};

function MedalIcons({ ori, argenti, bronzi }) {
  return <span>{'🥇'.repeat(ori)}{'🥈'.repeat(argenti)}{'🥉'.repeat(bronzi)}</span>;
}

const CategoryResults = ({ competitionId: propCompetitionId }) => {
  const params = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const effectiveCompetitionId = propCompetitionId || params.competitionId || query.get('competitionId') || query.get('competizioneId') || null;

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [atleti, setAtleti] = useState(null);
  const [club, setClub] = useState(null);
  const [error, setError] = useState(null);
  const [clubDetails, setClubDetails] = useState({});
  const [bestByFascia, setBestByFascia] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  let cancelled = false;
  const fetch = async () => {
    try {
      setLoading(true);
      const [atletiRes, clubRes] = await Promise.all([
        getAtletiResults(effectiveCompetitionId),
        getClubResults(effectiveCompetitionId),
      ]);

      if (cancelled) return;

      const listaAtleti = atletiRes.atleti;
      setAtleti(listaAtleti);
      setClub(clubRes);
      setBestByFascia(atletiRes.miglioriPerFasce);
      setLoading(false);
    } catch (err) {
      console.error('Errore risultati:', err);
      if (!cancelled) {
        setError('Errore caricamento risultati');
        setLoading(false);
      }
    }
  };

  fetch();
  return () => { cancelled = true; };
}, [effectiveCompetitionId]);

  const handleTab = (e, v) => setTab(v);

  const handleGoBack = () => {
    navigate('/categories');
  };


  const handleAccordion = async (clubId) => {
    if (clubDetails[clubId]) return;
    const details = await getClubMedalsDetails(clubId, effectiveCompetitionId);
    setClubDetails(prev => ({ ...prev, [clubId]: details }));
  };

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
        sx={{ mb: 2 }}
      >
        Torna a tutte le categorie
      </Button>
      <Typography variant="h4" gutterBottom>Risultati Generali</Typography>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={handleTab}>
          <Tab label="Miglior Atleta per Fascia" />
          <Tab label="Miglior Club per Medaglie" />
        </Tabs>
      </Paper>
        {tab === 0 && atleti && (
          <Box>
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
                      <TableCell>{a.club}</TableCell>
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
                <MedalIcons ori={c.ori} argenti={c.argenti} bronzi={c.bronzi} />
                <Typography variant="body2">Punti: {c.punti}</Typography>
              </Paper>
            ))}
          </Box>
          <Typography variant="h6" gutterBottom>Tutti i Club</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Club</TableCell>
                  <TableCell>Punti</TableCell>
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
                    <TableCell>{c.punti}</TableCell>
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
    </Container>
  );
};

export default CategoryResults;
