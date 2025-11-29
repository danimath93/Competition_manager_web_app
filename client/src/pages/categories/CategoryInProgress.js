import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
  TextField
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getSvolgimentoCategoria, getSvolgimentoCategoriaAtleti, patchSvolgimentoCategoria } from '../../api/svolgimentoCategorie';

const COMMISSIONE_LABELS = [
  'Capo Commissione',
  'Giudice 1',
  'Giudice 2',
  'Giudice 3',
  'Giudice 4',
  'Giudice 5',
  'Giudice di Riserva',
  '1° Addetto al Tavolo',
  '2° Addetto al Tavolo',
  '3° Addetto al Tavolo'
];

const CategoryInProgress = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const svolgimentoId = searchParams.get('svolgimentoId');

  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [caseType, setCaseType] = useState('other');
  const [atleti, setAtleti] = useState([]);
  const [punteggi, setPunteggi] = useState({});
  const [commissione, setCommissione] = useState(Array(10).fill(''));
  const [classifica, setClassifica] = useState([]);
  const [tabellone, setTabellone] = useState(null);
  const [stato, setStato] = useState('nuovo');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!svolgimentoId) {
      setError('ID svolgimento mancante');
      setLoading(false);
      return;
    }
    loadSvolgimento();
    // eslint-disable-next-line
  }, [svolgimentoId]);

  useEffect(() => {
    if (!tabellone && !caseType) return;
    if (tabellone) setCaseType('light');
    else setCaseType('quyen');
  }, [tabellone]);

  const loadSvolgimento = async () => {
    try {
      setLoading(true);
      const svolg = await getSvolgimentoCategoria(svolgimentoId);
      setLetter(svolg.letteraEstratta || '');
      setPunteggi(svolg.punteggi || {});
      setCommissione(svolg.commissione || Array(10).fill(''));
      setClassifica(svolg.classifica || []);
      setTabellone(svolg.tabellone || null);
      setStato(svolg.stato || 'nuovo');
      const atletiSnap = await getSvolgimentoCategoriaAtleti(svolgimentoId);
      setAtleti(atletiSnap || []);
    } catch (e) {
      setError('Errore nel caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/category-execution`);
  };

  const handlePunteggioChange = (atletaId, votoIdx, value) => {
    setPunteggi((prev) => {
      const prevAtleta = prev[atletaId] || [null, null, null, null, null];
      const newAtleta = [...prevAtleta];
      newAtleta[votoIdx] = value;
      const updated = { ...prev, [atletaId]: newAtleta };
      patchSvolgimentoCategoria(svolgimentoId, { punteggi: updated, stato: 'in_progress' });
      return updated;
    });
  };

  const handleCommissioneChange = (idx, value) => {
    setCommissione((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      patchSvolgimentoCategoria(svolgimentoId, { commissione: arr, stato: 'in_progress' });
      return arr;
    });
  };

  const getMedia = (arr) => {
    const nums = (arr || []).map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (nums.length === 0) return '';
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  };

  const getOrdinatiPerLettera = () => {
    if (!letter || !atleti.length) return atleti;
    const idx = atleti.findIndex((a) => (a.nome || '').toUpperCase().startsWith(letter));
    if (idx === -1) return [...atleti].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    return [
      ...atleti.slice(idx),
      ...atleti.slice(0, idx)
    ];
  };

  useEffect(() => {
    if (caseType !== 'quyen') return;
    const arr = getOrdinatiPerLettera().map((a) => ({
      atleta: a,
      media: parseFloat(getMedia(punteggi[a.id]))
    }));
    const sorted = arr
      .filter((x) => !isNaN(x.media))
      .sort((a, b) => b.media - a.media)
      .slice(0, 3);
    setClassifica(sorted);
    patchSvolgimentoCategoria(svolgimentoId, { classifica: sorted });
    // eslint-disable-next-line
  }, [punteggi, atleti, letter, caseType]);

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
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mt: 2 }}>
          Indietro
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 2 }}>
          Indietro
        </Button>
        <Typography variant="h4" gutterBottom>
          Svolgimento Categoria
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Box>

      {caseType === 'quyen' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tabella Punteggi (Lettera: <b>{letter || '-'}</b>)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome Atleta</TableCell>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <TableCell key={n}>Voto {n}</TableCell>
                      ))}
                      <TableCell>Totale</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getOrdinatiPerLettera().map((atleta) => (
                      <TableRow key={atleta.id}>
                        <TableCell>{atleta.nome} {atleta.cognome}</TableCell>
                        {[0, 1, 2, 3, 4].map((vIdx) => (
                          <TableCell key={vIdx}>
                            <TextField
                              type="number"
                              inputProps={{ min: 0, max: 9.9, step: 0.1 }}
                              value={punteggi[atleta.id]?.[vIdx] || ''}
                              onChange={(e) => handlePunteggioChange(atleta.id, vIdx, e.target.value)}
                              size="small"
                              sx={{ width: 70 }}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          {getMedia(punteggi[atleta.id])}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                CLASSIFICA
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Classifica</TableCell>
                      <TableCell>Nome e Cognome</TableCell>
                      <TableCell>Club</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[0, 1, 2].map((idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {classifica[idx]?.atleta
                            ? `${classifica[idx].atleta.nome} ${classifica[idx].atleta.cognome}`
                            : ''}
                        </TableCell>
                        <TableCell>
                          {classifica[idx]?.atleta?.club || ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                COMMISSIONE
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Qualifica</TableCell>
                      <TableCell>Nome e Cognome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {COMMISSIONE_LABELS.map((label, idx) => (
                      <TableRow key={label}>
                        <TableCell>{label}</TableCell>
                        <TableCell>
                          <TextField
                            value={commissione[idx] || ''}
                            onChange={(e) => handleCommissioneChange(idx, e.target.value)}
                            size="small"
                            sx={{ width: 180 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {caseType === 'light' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tabellone Light Contact
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Visualizzazione e gestione tabellone a scontri diretti in fase di sviluppo.
          </Alert>
          {/* Qui andrà la visualizzazione del bracket */}
        </Paper>
      )}

      {caseType === 'other' && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            WORK IN PROGRESS
          </Alert>
        </Paper>
      )}
    </Container>
  );
};

export default CategoryInProgress;