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
  Divider,
  Chip
} from '@mui/material';
import { PlayArrow, Print, ArrowBack } from '@mui/icons-material';
import { getCategoriesByCompetizione } from '../../api/categories';
import { startSvolgimentoCategoria } from '../../api/svolgimentoCategorie';
import { getCompetitionDetails } from '../../api/competitions';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadAllCategoryTypes } from '../../api/config';
import { getSvolgimentiByCompetizione } from '../../api/svolgimentoCategorie';
import { loadAllJudges } from '../../api/judges';
import CategoryNotebookPrint from './print/CategoryNotebookPrint';
import { CategoryStates } from '../../constants/enums/CategoryEnums';

const CategoryExecution = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const competizioneId = searchParams.get('competizioneId');

  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printCategory, setPrintCategory] = useState(null);
  const [allCategorie, setAllCategorie] = useState([]);
  const [categoryStates, setCategoryStates] = useState({});

  useEffect(() => {
    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }
    loadCompetition();
    loadCategories();
    loadCategoryType();
    loadCategoryStates();
  }, [competizioneId]);

  const loadCompetition = async () => {
    try {
      const data = await getCompetitionDetails(competizioneId);
      setCompetition(data);
    } catch (e) {
      setError('Impossibile caricare la competizione');
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesByCompetizione(competizioneId, false);
      setCategories(data);
    } catch (e) {
      setError('Impossibile caricare le categorie');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryType = async () => {
    try {
      const [categorie] = await Promise.all([
        loadAllCategoryTypes(),
      ]);
      setAllCategorie(categorie || []);
    } catch (error) {
      console.error('Errore nel caricamento dei config:', error);
    }
  };

  const loadCategoryStates = async () => {
    try {
      const svolgimenti = await getSvolgimentiByCompetizione(competizioneId);
      const statesMap = {};
      svolgimenti.forEach(svolg => {
        if (svolg.categoriaId) {
          statesMap[svolg.categoriaId] = svolg.stato || CategoryStates.DA_DEFINIRE;
        }
      });
      setCategoryStates(statesMap);
    } catch (error) {
      console.error('Errore nel caricamento degli stati:', error);
    }
  };

  const getName = (id) => {
    const tipo = allCategorie.find((cat) => cat.id === id);
    if (tipo) return tipo.nome;
    return null;
  };

  const getStatusColor = (stato) => {
    switch (stato) {
      case CategoryStates.DA_DEFINIRE:
        return 'default';
      case CategoryStates.IN_DEFINIZIONE:
        return 'info';
      case CategoryStates.IN_ATTESA_DI_AVVIO:
        return 'primary';
      case CategoryStates.IN_CORSO:
        return 'warning';
      case CategoryStates.CONCLUSA:
        return 'success';
      default:
        return 'default';
    }
  };

  const updateCategoryState = (categoriaId, newState) => {
    setCategoryStates((prevStates) => ({
      ...prevStates,
      [categoriaId]: newState
    }));
  }

  const handlePlay = async (cat) => {
    const res = await startSvolgimentoCategoria({categoriaId: cat.id, competizioneId});
    const pageParameters = "svolgimentoId=" + res?.svolgimentoId +
      "&categoriaNome=" + encodeURIComponent(cat?.nome) +
      "&competizioneId=" + competizioneId +
      "&tipoCompetizioneId=" + cat?.tipoCategoria?.tipoCompetizione?.id;
    navigate(`/category-execution/${cat.id}/category-in-progress?${pageParameters}`);
  };

  const handlePrintCategory = async (cat) => {
    const res = await startSvolgimentoCategoria({ categoriaId: cat.id, competizioneId });
    updateCategoryState(cat.id, res?.stato);
    setPrintCategory(cat);
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setPrintCategory(null);
  };

  const handleGoBack = () => {
    navigate('/categories');
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
                <TableCell>Stato</TableCell>
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
                    <Chip 
                      label={categoryStates[cat.id] || CategoryStates.DA_DEFINIRE}
                      color={getStatusColor(categoryStates[cat.id] || CategoryStates.DA_DEFINIRE)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handlePlay(cat)}>
                      <PlayArrow />
                    </IconButton>
                    <IconButton 
                      color="info" 
                      onClick={() => { handlePrintCategory(cat); }}
                      title="Stampa Quaderno di Gara"
                    >
                      <Print />
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

      {/* Competition Notebook Print Modal */}
      <CategoryNotebookPrint
        open={showPrintModal}
        onClose={() => { handleClosePrintModal(); }}
        category={printCategory}
      />
    </Container>
  );
};

export default CategoryExecution;