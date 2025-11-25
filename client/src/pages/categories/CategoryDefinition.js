import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import { ArrowBack, Refresh, Edit, Delete, CallSplit, MergeType, Save, ExpandMore, ExpandLess, DeleteSweep } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCompetitionDetails } from '../../api/competitions';
import {
  getCategoriesByCompetizione,
  deleteCategoria,
  deleteCategoriesByCompetition,
  generateCategories,
  saveCategories,
  getGruppiEta
} from '../../api/categories';
import { loadAthleteTypes, loadAllCategoryTypes } from '../../api/config';

const CategoryDefinition = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const competizioneId = searchParams.get('competizioneId');
  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [generatedCategories, setGeneratedCategories] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  // Config data for filters
  const [allTipiAtleta, setAllTipiAtleta] = useState([]);
  const [allCategorie, setAllCategorie] = useState([]);

  // Pagination and filters
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    tipoAtletaId: '',
    tipoCategoriaId: '',
    genere: ''
  });

  // Dialog states
  const [editDialog, setEditDialog] = useState({ open: false, categoria: null, originalNome: null });
  const [mergeDialog, setMergeDialog] = useState({ open: false, categoria1: null, categoria2: null });
  const [splitDialog, setSplitDialog] = useState({ open: false, categoria: null, atleti1: [], atleti2: [], nome1: '', nome2: '' });

  useEffect(() => {
    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }

    loadCompetitionData();
    loadConfigData();
  }, [competizioneId, user]);

  const loadCompetitionData = async () => {
    try {
      setLoading(true);
      const data = await getCompetitionDetails(competizioneId);
      setCompetition(data);
      
      // Controllo permessi
      const userPermissions = user?.permissions || '';
      const userClubId = user?.clubId;
      
      const isAdmin = userPermissions === 'admin' || userPermissions === 'superAdmin';
      const isOrganizer = userPermissions === 'club' && userClubId === data.organizzatoreClubId;
      
      setHasPermission(isAdmin || isOrganizer);
      
      if (isAdmin || isOrganizer) {
        await loadCategories();
      }
      
      setError(null);
    } catch (error) {
      console.error('Errore nel caricamento della competizione:', error);
      setError('Impossibile caricare i dati della competizione');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByCompetizione(competizioneId);
      setCategories(data);
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    }
  };

  const loadConfigData = async () => {
    try {
      const [tipiAtleta, categorie, gruppiEta] = await Promise.all([
        loadAthleteTypes(),
        loadAllCategoryTypes(),
      ]);
      setAllTipiAtleta(tipiAtleta || []);
      setAllCategorie(categorie || []);
    } catch (error) {
      console.error('Errore nel caricamento dei config:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/categories');
  };

  const handleGenerateCategories = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await generateCategories(competizioneId, {});
      setGeneratedCategories(response.categorie || []);
      setIsGenerated(true);
      setSuccess(`Generate ${response.totaleCategorie || response.categorie?.length || 0} categorie con ${response.totaleAtleti || 0} atleti totali`);
    } catch (error) {
      console.error('Errore nella generazione:', error);
      setError(error.response?.data?.message || 'Errore nella generazione delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategories = async () => {
    if (generatedCategories.length === 0) {
      setError('Nessuna categoria da salvare');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let categoriesToSave = [...generatedCategories];

      // Rimuovo le info atleti non necessarie
      categoriesToSave = categoriesToSave.map(cat => ({ 
        ...cat,
        atleti: cat.atleti.map(atleta => {
          return {
            id: atleta.id,
            iscrizioneId: atleta.iscrizioneId
           };
        })
      }));
          

      await saveCategories(competizioneId, {
        categorie: categoriesToSave
      });

      setSuccess('Categorie salvate con successo!');
      setIsGenerated(false);
      setGeneratedCategories([]);
      await loadCategories();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      setError(error.response?.data?.message || 'Errore nel salvataggio delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoriaId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteCategoria(categoriaId);
      setSuccess('Categoria eliminata con successo');
      await loadCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Errore nell\'eliminazione della categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllCategories = async () => {
    if (!window.confirm(`Sei sicuro di voler eliminare tutte le ${categories.length} categorie? Questa azione non può essere annullata.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteCategoriesByCompetition(competizioneId);
      setSuccess('Tutte le categorie sono state eliminate con successo');
      await loadCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Errore nell\'eliminazione delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategoria = (categoria, isGeneratedCard) => {
    setEditDialog({ 
      open: true, 
      categoria: { ...categoria },
      originalNome: categoria.nome,
      isGenerated: isGeneratedCard
    });
  };

  const handleSaveEdit = () => {
    const { categoria, originalNome, isGenerated: isGeneratedCard } = editDialog;
    
    if (isGeneratedCard) {
      const updated = generatedCategories.map(cat => 
        cat.nome === originalNome ? categoria : cat
      );
      setGeneratedCategories(updated);
      setSuccess('Categoria modificata');
    }
    
    setEditDialog({ open: false, categoria: null, originalNome: null });
  };

  const handleOpenMerge = () => {
    if (isGenerated) {
      setMergeDialog({ open: true, categoria1: null, categoria2: null });
    }
  };

  const handleMerge = async () => {
    const { categoria1, categoria2 } = mergeDialog;
    
    if (!categoria1 || !categoria2) {
      setError('Seleziona due categorie da unire');
      return;
    }

    if (isGenerated) {
      const cat1 = generatedCategories.find(c => c.nome === categoria1);
      const cat2 = generatedCategories.find(c => c.nome === categoria2);
      
      const merged = {
        ...cat1,
        nome: `${cat1.nome}_${cat2.nome}`,
        atleti: [...cat1.atleti, ...cat2.atleti]
      };

      const updated = generatedCategories
        .filter(c => c.nome !== categoria2)
        .map(c => c.nome === categoria1 ? merged : c);
      
      setGeneratedCategories(updated);
      setMergeDialog({ open: false, categoria1: null, categoria2: null });
      setSuccess('Categorie unite');
    }
  };

  const handleOpenSplit = (categoria) => {
    setSplitDialog({
      open: true,
      categoria: categoria,
      atleti1: [],
      atleti2: [],
      nome1: `${categoria.nome}_A`,
      nome2: `${categoria.nome}_B`
    });
  };

  const handleSplit = () => {
    const { categoria, atleti1, atleti2, nome1, nome2 } = splitDialog;

    if (atleti1.length === 0 || atleti2.length === 0) {
      setError('Entrambe le categorie devono avere almeno un atleta');
      return;
    }

    if (isGenerated) {
      const cat1 = {
        ...categoria,
        nome: nome1,
        atleti: categoria.atleti.filter(a => atleti1.includes(a.id))
      };

      const cat2 = {
        ...categoria,
        nome: nome2,
        atleti: categoria.atleti.filter(a => atleti2.includes(a.id))
      };

      const updated = generatedCategories.map(c => 
        c.nome === categoria.nome ? cat1 : c
      );
      updated.push(cat2);

      setGeneratedCategories(updated);
      setSplitDialog({ open: false, categoria: null, atleti1: [], atleti2: [], nome1: '', nome2: '' });
      setSuccess('Categoria divisa');
    }
  };

  const handleToggleAtletaSplit = (atletaId, gruppo) => {
    const { atleti1, atleti2 } = splitDialog;
    
    if (gruppo === 1) {
      const newAtleti1 = atleti1.includes(atletaId)
        ? atleti1.filter(id => id !== atletaId)
        : [...atleti1, atletaId];
      const newAtleti2 = atleti2.filter(id => id !== atletaId);
      setSplitDialog({ ...splitDialog, atleti1: newAtleti1, atleti2: newAtleti2 });
    } else {
      const newAtleti2 = atleti2.includes(atletaId)
        ? atleti2.filter(id => id !== atletaId)
        : [...atleti2, atletaId];
      const newAtleti1 = atleti1.filter(id => id !== atletaId);
      setSplitDialog({ ...splitDialog, atleti1: newAtleti1, atleti2: newAtleti2 });
    }
  };

  const handleToggleExpand = (cardKey) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event, newValue) => {
    if (newValue !== null) {
      setRowsPerPage(newValue);
      setPage(1);
    }
  };

  // Funzione per filtrare le categorie
  const getFilteredCategories = (categoriesList) => {
    return categoriesList.filter(categoria => {
      if (filters.tipoAtletaId && categoria.tipoAtletaId !== filters.tipoAtletaId) return false;
      if (filters.tipoCategoriaId && categoria.tipoCategoriaId !== filters.tipoCategoriaId) return false;
      if (filters.genere && categoria.genere !== filters.genere) return false;
      return true;
    });
  };

  // Funzione per ottenere le categorie paginate
  const getPaginatedCategories = (categoriesList) => {
    const filtered = getFilteredCategories(categoriesList);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / rowsPerPage)
    };
  };

  // Ottieni valori unici per i filtri dalle categorie
  const getUniqueFilterValues = (categoriesList) => {
    // Ottieni i valori presenti nelle categorie
    const presentTipiAtleta = [...new Set(categoriesList.map(c => c.tipoAtletaId).filter(Boolean))];
    const presentCategorie = [...new Set(categoriesList.map(c => c.tipoCategoriaId).filter(Boolean))];
    const generi = [...new Set(categoriesList.map(c => c.genere).filter(Boolean))];
    
    // Filtra i config per mostrare solo quelli effettivamente presenti
    const tipiAtleta = allTipiAtleta.filter(tipo => presentTipiAtleta.includes(tipo.id));
    const categorie = allCategorie.filter(cat => presentCategorie.includes(cat.id));
    
    return { tipiAtleta, categorie, generi };
  };

  const renderCategoriaCard = (categoria, index, isGeneratedCard) => {
    const cardKey = `${isGeneratedCard ? 'gen' : 'saved'}_${index}`;
    const isExpanded = expandedCards[cardKey] || false;
    const atleti = isGeneratedCard ? categoria.atleti : categoria.iscrizioni || [];
    
    return (
      <Card key={index} sx={{ width: 500, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Titolo con tooltip */}
            <Tooltip title={categoria.nome} arrow placement="top">
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.95rem', 
                  mb: 0.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {categoria.nome}
              </Typography>
            </Tooltip>

            {/* Container scrollabile orizzontalmente per chips e bottoni */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5, 
              mb: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '3px'
              }
            }}>
              {/* Chips */}
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Chip 
                  label={`Genere: ${categoria.genere}`} 
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                {categoria.grado && (
                  <Chip 
                    label={`Grado: ${categoria.grado}`} 
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                {categoria.gradoEta && (
                  <Chip 
                    label={`Grado Età: ${categoria.gradoEta}`} 
                    size="small" 
                    color="secondary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                {categoria.livello && (
                  <Chip 
                    label={`Livello: ${categoria.livello}`} 
                    size="small" 
                    color="secondary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                <Chip 
                  label={`${atleti.length} atleti`} 
                  size="small" 
                  color="primary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>

              {/* Bottoni azioni sulla stessa riga */}
              <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto', flexShrink: 0 }}>
                {isGeneratedCard ? (
                  <>
                    <IconButton size="small" onClick={() => handleEditCategoria(categoria, true)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenSplit(categoria)}>
                      <CallSplit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        const updated = generatedCategories.filter(c => c.nome !== categoria.nome);
                        setGeneratedCategories(updated);
                        setSuccess('Categoria rimossa dall\'anteprima');
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton size="small" onClick={() => handleEditCategoria(categoria, false)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(categoria.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                )}
                <IconButton 
                  size="small" 
                  onClick={() => handleToggleExpand(cardKey)}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </Box>

            {/* Contenuto espandibile */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ mb: 1.5 }} />
              {atleti.length > 0 ? (
                <TableContainer sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0, width: '40%' }}><strong>Atleta</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0, width: '20%' }}><strong>Peso (kg)</strong></TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0, width: '40%' }}><strong>Club</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {atleti.map((item, idx) => {
                        const atleta = isGeneratedCard ? item : item.atleta;
                        const club = isGeneratedCard ? item.club : item.atleta?.club;
                        return (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              {atleta.nome} {atleta.cognome}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              {atleta.peso || item.peso || '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              {club?.denominazione || club?.nome || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Nessun atleta iscritto
                </Typography>
              )}
            </Collapse>
          </CardContent>
        </Card>
    );
  };  if (loading) {
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
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </Button>
      </Container>
    );
  }

  if (!competition) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="warning">Competizione non trovata</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </Button>
      </Container>
    );
  }

  // Controllo permessi - mostra messaggio se l'utente non ha i permessi
  if (!hasPermission) {
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
        </Box>
        
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Permesso Negato
          </Typography>
          <Typography variant="body2">
            Non hai i permessi necessari per accedere alla definizione delle categorie di questa competizione.
            {' '}Solo gli amministratori o il club organizzatore possono accedere a questa sezione.
          </Typography>
        </Alert>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {competition.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(competition.dataInizio).toLocaleDateString('it-IT')} - {new Date(competition.dataFine).toLocaleDateString('it-IT')}
          </Typography>
          {competition.organizzatore && (
            <Typography variant="body2" color="text.secondary">
              Organizzatore: {competition.organizzatore.denominazione}
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header con bottone torna indietro */}
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Torna a tutte le categorie
        </Button>
        
        <Typography variant="h4" gutterBottom>
          Definizione Categorie
        </Typography>
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
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Messaggi di errore e successo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Bottone Genera Categorie */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Generazione Categorie
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Genera automaticamente le categorie per questa competizione
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleGenerateCategories}
            disabled={loading || isGenerated}
            size="large"
          >
            Genera Categorie
          </Button>
        </Box>
      </Paper>

      {/* Categorie Generate (Prima del salvataggio) */}
      {isGenerated && generatedCategories.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Anteprima Categorie Generate ({generatedCategories.length})
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<MergeType />}
                onClick={handleOpenMerge}
                sx={{ mr: 1 }}
              >
                Unisci
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveCategories}
                disabled={loading}
              >
                Salva Categorie
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Queste categorie non sono ancora state salvate. Puoi modificarle, unirle o dividerle prima di confermare.
          </Alert>

          {/* Filtri per categorie generate */}
          <Paper elevation={0} sx={{ py: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Tipo Atleta</InputLabel>
                  <Select
                    value={filters.tipoAtletaId}
                    onChange={(e) => handleFilterChange('tipoAtletaId', e.target.value)}
                    label="Tipo Atleta"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {getUniqueFilterValues(generatedCategories).tipiAtleta.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>{tipo.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filters.tipoCategoriaId}
                    onChange={(e) => handleFilterChange('tipoCategoriaId', e.target.value)}
                    label="Categoria"
                  >
                    <MenuItem value="">Tutte</MenuItem>
                    {getUniqueFilterValues(generatedCategories).categorie.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Genere</InputLabel>
                  <Select
                    value={filters.genere}
                    onChange={(e) => handleFilterChange('genere', e.target.value)}
                    label="Genere"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {getUniqueFilterValues(generatedCategories).generi.map((gen, idx) => (
                      <MenuItem key={idx} value={gen}>{gen}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, minHeight: 800 }}>
            {getPaginatedCategories(generatedCategories).items.map((categoria, index) => (
              <Box key={`gen_${(page - 1) * rowsPerPage + index}`}>
                {renderCategoriaCard(categoria, (page - 1) * rowsPerPage + index, true)}
              </Box>
            ))}
          </Box>

          {/* Controlli paginazione in fondo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Mostra per pagina:
              </Typography>
              <ToggleButtonGroup
                value={rowsPerPage}
                exclusive
                onChange={handleRowsPerPageChange}
                size="small"
              >
                <ToggleButton value={5}>5</ToggleButton>
                <ToggleButton value={10}>10</ToggleButton>
                <ToggleButton value={25}>25</ToggleButton>
                <ToggleButton value={50}>50</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Totale: {getPaginatedCategories(generatedCategories).total} categorie
            </Typography>
            {getPaginatedCategories(generatedCategories).totalPages > 1 && (
              <Pagination
                count={getPaginatedCategories(generatedCategories).totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Categorie Salvate */}
      {categories.length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Categorie Salvate ({categories.length})
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweep />}
              onClick={handleDeleteAllCategories}
              disabled={loading}
            >
              Elimina Tutte
            </Button>
          </Box>

          {/* Filtri per categorie salvate */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Filtri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Tipo Atleta</InputLabel>
                  <Select
                    value={filters.tipoAtletaId}
                    onChange={(e) => handleFilterChange('tipoAtletaId', e.target.value)}
                    label="Tipo Atleta"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {getUniqueFilterValues(categories).tipiAtleta.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>{tipo.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filters.tipoCategoriaId}
                    onChange={(e) => handleFilterChange('tipoCategoriaId', e.target.value)}
                    label="Categoria"
                  >
                    <MenuItem value="">Tutte</MenuItem>
                    {getUniqueFilterValues(categories).categorie.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Genere</InputLabel>
                  <Select
                    value={filters.genere}
                    onChange={(e) => handleFilterChange('genere', e.target.value)}
                    label="Genere"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {getUniqueFilterValues(categories).generi.map((gen, idx) => (
                      <MenuItem key={idx} value={gen}>{gen}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, minHeight: 800 }}>
            {getPaginatedCategories(categories).items.map((categoria, index) => (
              <Box key={`saved_${(page - 1) * rowsPerPage + index}`}>
                {renderCategoriaCard(categoria, (page - 1) * rowsPerPage + index, false)}
              </Box>
            ))}
          </Box>

          {/* Controlli paginazione in fondo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Mostra per pagina:
              </Typography>
              <ToggleButtonGroup
                value={rowsPerPage}
                exclusive
                onChange={handleRowsPerPageChange}
                size="small"
              >
                <ToggleButton value={5}>5</ToggleButton>
                <ToggleButton value={10}>10</ToggleButton>
                <ToggleButton value={25}>25</ToggleButton>
                <ToggleButton value={50}>50</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Totale: {getPaginatedCategories(categories).total} categorie
            </Typography>
            {getPaginatedCategories(categories).totalPages > 1 && (
              <Pagination
                count={getPaginatedCategories(categories).totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            )}
          </Box>
        </Paper>
      ) : !isGenerated && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            Non ci sono ancora categorie definite per questa competizione.
            Usa il bottone "Genera Categorie" per crearle automaticamente.
          </Alert>
        </Paper>
      )}

      {/* Dialog Modifica */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, categoria: null, originalNome: null })}>
        <DialogTitle>Modifica Categoria</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome Categoria"
            value={editDialog.categoria?.nome || ''}
            onChange={(e) => setEditDialog({ 
              ...editDialog, 
              categoria: { ...editDialog.categoria, nome: e.target.value } 
            })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, categoria: null, originalNome: null })}>
            Annulla
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Unisci */}
      <Dialog open={mergeDialog.open} onClose={() => setMergeDialog({ open: false, categoria1: null, categoria2: null })}>
        <DialogTitle>Unisci Categorie</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Prima Categoria</InputLabel>
            <Select
              value={mergeDialog.categoria1 || ''}
              onChange={(e) => setMergeDialog({ ...mergeDialog, categoria1: e.target.value })}
              label="Prima Categoria"
            >
              {generatedCategories.map((cat, idx) => (
                <MenuItem key={idx} value={cat.nome}>
                  {cat.nome} ({cat.atleti?.length || 0} atleti)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Seconda Categoria</InputLabel>
            <Select
              value={mergeDialog.categoria2 || ''}
              onChange={(e) => setMergeDialog({ ...mergeDialog, categoria2: e.target.value })}
              label="Seconda Categoria"
            >
              {generatedCategories.map((cat, idx) => (
                <MenuItem key={idx} value={cat.nome} disabled={cat.nome === mergeDialog.categoria1}>
                  {cat.nome} ({cat.atleti?.length || 0} atleti)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialog({ open: false, categoria1: null, categoria2: null })}>
            Annulla
          </Button>
          <Button onClick={handleMerge} variant="contained">
            Unisci
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Dividi */}
      <Dialog 
        open={splitDialog.open} 
        onClose={() => setSplitDialog({ open: false, categoria: null, atleti1: [], atleti2: [], nome1: '', nome2: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Dividi Categoria: {splitDialog.categoria?.nome}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nome Prima Categoria"
                value={splitDialog.nome1 || ''}
                onChange={(e) => setSplitDialog({ ...splitDialog, nome1: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                Atleti Gruppo 1 ({splitDialog.atleti1.length})
              </Typography>
              <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
                {splitDialog.categoria?.atleti?.map((atleta) => (
                  <ListItem key={atleta.id}>
                    <Checkbox
                      checked={splitDialog.atleti1.includes(atleta.id)}
                      onChange={() => handleToggleAtletaSplit(atleta.id, 1)}
                    />
                    <ListItemText 
                      primary={`${atleta.nome} ${atleta.cognome}`}
                      secondary={atleta.peso ? `${atleta.peso}kg` : ''}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nome Seconda Categoria"
                value={splitDialog.nome2 || ''}
                onChange={(e) => setSplitDialog({ ...splitDialog, nome2: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                Atleti Gruppo 2 ({splitDialog.atleti2.length})
              </Typography>
              <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
                {splitDialog.categoria?.atleti?.map((atleta) => (
                  <ListItem key={atleta.id}>
                    <Checkbox
                      checked={splitDialog.atleti2.includes(atleta.id)}
                      onChange={() => handleToggleAtletaSplit(atleta.id, 2)}
                    />
                    <ListItemText 
                      primary={`${atleta.nome} ${atleta.cognome}`}
                      secondary={atleta.peso ? `${atleta.peso}kg` : ''}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSplitDialog({ open: false, categoria: null, atleti1: [], atleti2: [], nome1: '', nome2: '' })}>
            Annulla
          </Button>
          <Button onClick={handleSplit} variant="contained">
            Dividi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryDefinition;
