import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip
} from '@mui/material';
import { PlayArrow, Download, Autorenew, ArrowBack } from '@mui/icons-material';
import { getCategoriesByCompetizione } from '../../api/categories';
import { startSvolgimentoCategoria, getSvolgimentoCategoria } from '../../api/svolgimentoCategorie';
import { getCompetitionDetails, getCompetizioneLetter } from '../../api/competitions';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadAllCategoryTypes } from '../../api/config';
import { startSvolgimento,  getSvolgimentiByCompetizione } from '../../api/svolgimentoCategorie';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const CategoryExecution = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const competizioneId = searchParams.get('competizioneId');

  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [letter, setLetter] = useState('');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [allCategorie, setAllCategorie] = useState([]);
  const [letterLocked, setLetterLocked] = useState(false);

  useEffect(() => {
    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }
    loadCompetition();
    loadCategories();
    loadCategoryType();
    setLetter(''); // reset lettera all'apertura
    const loadLetter = async () => {
      const res = await getCompetizioneLetter(competizioneId);
      setLetter(res.letteraEstratta || '');
    };
    loadLetter();
    // eslint-disable-next-line
  }, [competizioneId]);
/*
  useEffect(() => {
    const loadLetter = async () => {
      const res = await getCompetizioneLetter(competizioneId);
      setLetter(res.letteraEstratta || '');
    };
    loadLetter();
  }, [competizioneId]);*/
  
  useEffect(() => {
    const controllaSvolgimenti = async () => {
      const svolg = await getSvolgimentiByCompetizione(competizioneId);
      const locked = svolg.some(s => s.stato !== 'nuovo');
      setLetterLocked(locked);
    };
    controllaSvolgimenti();
  }, []);

  const loadCompetition = async () => {
    try {
      const data = await getCompetitionDetails(competizioneId);
      setCompetition(data);
      setLetter(data.letteraEstratta);
    } catch (e) {
      setError('Impossibile caricare la competizione');
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesByCompetizione(competizioneId);
      setCategories(data);
    } catch (e) {
      setError('Impossibile caricare le categorie');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryType = async () => {
    try {
      const categorie = await loadAllCategoryTypes();
      setAllCategorie(categorie || []);
    } catch (error) {
      console.error('Errore nel caricamento dei config:', error);
    }
  };

   const getName = (id) => {
    const tipo = allCategorie.find((cat) => cat.id === id);
    if (tipo) return tipo.nome;
    return null;
  };

  const handleGenerateLetter = () => {
    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    setLetter(randomLetter);
  };

const handlePlay = async (cat) => {

  // DETERMINA CASE TYPE DAL TIPOLOGIA DELLA CATEGORIA
  const tipoCompleto = getName(cat.tipoCategoriaId) || "";
  const primaParola = tipoCompleto.split(" ")[0].toLowerCase();

  let caseType = "other";
  if (primaParola === "quyen") caseType = "quyen";
  else if (primaParola === "light") caseType = "light";
  else if (primaParola === "fighting") caseType = "fighting";

  const res = await startSvolgimentoCategoria({
    categoriaId: cat.id,
    competizioneId,
    letteraEstratta: letter
  });

  navigate(
    `/category-execution/${cat.id}/category-in-progress?svolgimentoId=${res.svolgimentoId}&categoriaNome=${encodeURIComponent(cat.nome)}&competizioneId=${competizioneId}`,
    {
      state: { caseType }   // 🔥 PASSIAMO IL CASE TYPE SENZA URL
    }
  );
};


  const handleGoBack = () => {
    navigate('/categories');
  };
  const handleDownloadExcel = () => {
    setWorkDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setWorkDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Torna a tutte le categorie
        </Button>
        <Typography variant="h4" gutterBottom>
          Svolgimento Categorie
        </Typography>
        {competition && (
          <>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {competition.nome}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {new Date(competition.dataInizio).toLocaleDateString('it-IT')} - {new Date(competition.dataFine).toLocaleDateString('it-IT')}
              </Typography>
              <Chip label={competition.stato} color="primary" size="small" />
            </Box>
            {competition.organizzatore && (
              <Typography variant="body2" color="text.secondary">
                Organizzatore: {competition.organizzatore.denominazione}
              </Typography>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Sezione Lettera estratta */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Lettera estratta:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
            {letter || '-'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Autorenew />}
            disabled={letterLocked}
            onClick={handleGenerateLetter}
            sx={{ ml: 2 }}
          >
            Estrai nuova lettera
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          La lettera verrà salvata solo all'avvio dello svolgimento della categoria.
        </Typography>
      </Paper>

      {/* Lista categorie */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Categorie definite
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipologia</TableCell>
                <TableCell>Genere</TableCell>
                <TableCell>Età</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.nome}</TableCell>
                  <TableCell>{cat.tipoCategoriaId && cat.tipoCategoriaId ? getName(cat.tipoCategoriaId) : '-'}</TableCell>
                  <TableCell>{cat.genere}</TableCell>
                  <TableCell>
                    {cat.etaMinima} - {cat.etaMassima}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handlePlay(cat)}>
                      <PlayArrow />
                    </IconButton>
                    <IconButton color="secondary" onClick={handleDownloadExcel}>
                      <Download />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      Nessuna categoria trovata.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={categories.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Modale WORK IN PROGRESS */}
      <Dialog open={workDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>WORK IN PROGRESS</DialogTitle>
        <DialogContent>
          <Typography>La funzione di download Excel sarà disponibile prossimamente.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryExecution;