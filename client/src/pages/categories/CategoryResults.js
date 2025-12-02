import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getAtletiResults, getClubResults, getClubMedalsDetails } from '../../api/results';

const medalEmoji = {
  oro: '🥇',
  argento: '🥈',
  bronzo: '🥉'
};

function MedalIcons({ ori, argenti, bronzi }) {
  return <span>{'🥇'.repeat(ori)}{'🥈'.repeat(argenti)}{'🥉'.repeat(bronzi)}</span>;
}

const CategoryResults = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [atleti, setAtleti] = useState(null);
  const [club, setClub] = useState(null);
  const [error, setError] = useState(null);
  const [clubDetails, setClubDetails] = useState({});

useEffect(() => {
  setLoading(true);

  Promise.all([getAtletiResults(), getClubResults()])
    .then(([atletiRes, clubRes]) => {

      // atletiRes è un array di:
      // { atletaId, nome, cognome, club, medaglie:{oro,argento,bronzo} }

      setAtleti(atletiRes);
      setClub(clubRes);

      setLoading(false);
    })
    .catch((err) => {
      console.error("Errore risultati:", err);
      setError("Errore caricamento risultati");
      setLoading(false);
    });
}, []);

  const handleTab = (e, v) => setTab(v);

  const handleAccordion = async (clubId) => {
    if (clubDetails[clubId]) return;
    const details = await getClubMedalsDetails(clubId);
    setClubDetails(prev => ({ ...prev, [clubId]: details }));
  };

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Risultati Generali</Typography>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={handleTab}>
          <Tab label="Miglior Atleta per Fascia" />
          <Tab label="Miglior Club per Medaglie" />
        </Tabs>
      </Paper>
        {tab === 0 && atleti && (
          <Box>
            <Typography variant="h6" gutterBottom>Classifica completa medagliati</Typography>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Atleta</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>🥇</TableCell>
                    <TableCell>🥈</TableCell>
                    <TableCell>🥉</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atleti.map(a => (
                    <TableRow key={a.atletaId}>
                      <TableCell>{a.nome} {a.cognome}</TableCell>
                      <TableCell>{a.club}</TableCell>
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
                          {clubDetails[c.clubId] ? (
                            <Box>
                              {clubDetails[c.clubId].atleti.map(a => (
                                <Box key={a.id} sx={{ mb: 1 }}>
                                  <b>{a.nome} {a.cognome}</b>: <MedalIcons ori={a.ori} argenti={a.argenti} bronzi={a.bronzi} />
                                </Box>
                              ))}
                            </Box>
                          ) : <CircularProgress size={20} />}
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
