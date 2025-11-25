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
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ArrowBack, Refresh, Edit, Delete, CallSplit, MergeType, Save, ExpandMore, ExpandLess, DeleteSweep, Settings } from '@mui/icons-material';
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
import CategorySplit from './CategorySplit';

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
  const [allGruppiEta, setAllGruppiEta] = useState([]);

  // Pagination and filters
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    tipoAtletaId: '',
    tipoCategoriaId: '',
    genere: '',
    gruppoEtaId: ''
  });

  // Dialog states
  const [editDialog, setEditDialog] = useState({ open: false, categoria: null, originalNome: null });
  const [mergeDialog, setMergeDialog] = useState({ open: false, mergedName: '' });
  const [splitDialog, setSplitDialog] = useState({ open: false, categoria: null });
  
  // Merge mode state
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState([]);

  // Opzioni di generazione personalizzata
  const [showGenerationOptions, setShowGenerationOptions] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    unisciAttivitaComplementari: false,
    unisciLivelloEsperienza: false
  });

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
        getGruppiEta()
      ]);
      setAllTipiAtleta(tipiAtleta || []);
      setAllCategorie(categorie || []);
      setAllGruppiEta(gruppiEta || []);
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
      const response = await generateCategories(competizioneId, generationOptions);
      setGeneratedCategories(response.categorie || []);
      setIsGenerated(true);
      setSuccess(`Generate ${response.totaleCategorie || response.categorie?.length || 0} categorie con ${response.totaleAtleti || 0} atleti totali`);
      
      // Chiudi il pannello opzioni dopo la generazione
      setShowGenerationOptions(false);
    } catch (error) {
      console.error('Errore nella generazione:', error);
      setError(error.response?.data?.message || 'Errore nella generazione delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGenerationOption = (option) => {
    setGenerationOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
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

  const handleSaveSingleCategory = async (categoria) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepara la categoria per il salvataggio rimuovendo info atleti non necessarie
      const categoriaToSave = {
        ...categoria,
        atleti: categoria.atleti.map(atleta => ({
          id: atleta.id,
          iscrizioneId: atleta.iscrizioneId
        }))
      };

      await saveCategories(competizioneId, {
        categorie: [categoriaToSave]
      });

      // Rimuovi la categoria dalla lista delle generate
      const updated = generatedCategories.filter(c => c.nome !== categoria.nome);
      setGeneratedCategories(updated);
      
      // Se non ci sono più categorie generate, disattiva la modalità generata
      if (updated.length === 0) {
        setIsGenerated(false);
      }

      setSuccess(`Categoria "${categoria.nome}" salvata con successo!`);
      await loadCategories();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      setError(error.response?.data?.message || 'Errore nel salvataggio della categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCategories = () => {
    if (!window.confirm('Sei sicuro di voler annullare tutte le categorie generate? Questa azione non può essere annullata.')) {
      return;
    }

    setGeneratedCategories([]);
    setIsGenerated(false);
    setSuccess('Categorie generate annullate con successo');
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
      setIsMergeMode(true);
      setSelectedForMerge([]);
    }
  };

  const handleToggleMergeSelection = (categoriaNome) => {
    setSelectedForMerge(prev => {
      if (prev.includes(categoriaNome)) {
        return prev.filter(nome => nome !== categoriaNome);
      } else {
        return [...prev, categoriaNome];
      }
    });
  };

  const handleConfirmMerge = () => {
    if (selectedForMerge.length < 2) {
      setError('Seleziona almeno due categorie da unire');
      return;
    }

    setMergeDialog({ open: true, mergedName: selectedForMerge.join('_') });
  };

  const handleCancelMerge = () => {
    setIsMergeMode(false);
    setSelectedForMerge([]);
  };

  const handleMerge = async () => {
    const { mergedName } = mergeDialog;
    
    if (!mergedName || !mergedName.trim()) {
      setError('Inserisci un nome per la categoria unita');
      return;
    }

    if (isGenerated && selectedForMerge.length >= 2) {
      const categoriesToMerge = generatedCategories.filter(c => selectedForMerge.includes(c.nome));
      
      // Unisci tutti gli atleti delle categorie selezionate
      const allAtleti = categoriesToMerge.reduce((acc, cat) => [...acc, ...cat.atleti], []);
      
      // Usa i dati della prima categoria selezionata come base
      const baseCategoria = categoriesToMerge[0];
      
      const merged = {
        ...baseCategoria,
        nome: mergedName.trim(),
        atleti: allAtleti
      };

      // Rimuovi tutte le categorie unite tranne la prima (che verrà sostituita)
      const updated = generatedCategories
        .filter(c => !selectedForMerge.includes(c.nome) || c.nome === selectedForMerge[0])
        .map(c => c.nome === selectedForMerge[0] ? merged : c);
      
      setGeneratedCategories(updated);
      setMergeDialog({ open: false, mergedName: '' });
      setIsMergeMode(false);
      setSelectedForMerge([]);
      setSuccess(`${selectedForMerge.length} categorie unite con successo`);
    }
  };

  const handleOpenSplit = (categoria) => {
    setSplitDialog({
      open: true,
      categoria: categoria
    });
  };

  const handleSplit = ({ categoria1, categoria2 }) => {
    if (isGenerated) {
      const updated = generatedCategories.map(c => 
        c.nome === splitDialog.categoria.nome ? categoria1 : c
      );
      updated.push(categoria2);

      setGeneratedCategories(updated);
      setSplitDialog({ open: false, categoria: null });
      setSuccess('Categoria divisa con successo');
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
      if (filters.tipoAtletaId && !categoria.tipiAtletaId.includes(filters.tipoAtletaId)) return false;
      if (filters.tipoCategoriaId && categoria.tipoCategoriaId !== filters.tipoCategoriaId) return false;
      if (filters.genere && categoria.genere !== filters.genere) return false;
      if (filters.gruppoEtaId && !categoria.gruppiEtaId.includes(filters.gruppoEtaId)) return false;

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
    // tipiAtletaId e' un array contenente gli id dei tipi atleta usati nella categoria
    const presentTipiAtleta = [...new Set(categoriesList.flatMap(c => c.tipiAtletaId).filter(Boolean))];
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
    const isSelected = selectedForMerge.includes(categoria.nome);
    
    return (
      <Card 
        key={index} 
        sx={{ 
          width: 500, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          border: isSelected ? '2px solid' : 'none',
          borderColor: isSelected ? 'primary.main' : 'transparent'
        }}
      >
          <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Titolo con toggle per merge mode */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Tooltip title={categoria.nome} arrow placement="top">
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}
                >
                  {categoria.nome}
                </Typography>
              </Tooltip>
              {isMergeMode && isGeneratedCard && (
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggleMergeSelection(categoria.nome)}
                  size="small"
                  sx={{ p: 0 }}
                />
              )}
            </Box>

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
                    <IconButton 
                      size="small" 
                      onClick={() => handleSaveSingleCategory(categoria)}
                      color="primary"
                      title="Salva categoria"
                    >
                      <Save fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditCategoria(categoria, true)} title="Modifica">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenSplit(categoria)} title="Dividi">
                      <CallSplit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        const updated = generatedCategories.filter(c => c.nome !== categoria.nome);
                        setGeneratedCategories(updated);
                        setSuccess('Categoria rimossa dall\'anteprima');
                      }}
                      title="Elimina"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton size="small" onClick={() => handleEditCategoria(categoria, false)} title="Modifica">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(categoria.id)} title="Elimina">
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
                        { isGeneratedCard ? (
                          <TableCell sx={{ fontSize: '0.75rem', py: 0, width: '40%' }}><strong>Esperienza</strong></TableCell>
                        ) : (
                          <TableCell sx = {{ fontSize: '0.75rem', py: 0, width: '40%' }}><strong>Club</strong></TableCell>
                        )
                         }
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
                            {
                              isGeneratedCard ? (
                                <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                  {item.esperienza || '-'}
                                </TableCell>
                              ) : (
                                <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                  {club?.denominazione || club?.nome || '-'}
                                </TableCell>
                              )
                            }
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setShowGenerationOptions(!showGenerationOptions)}
              disabled={loading || isGenerated}
              size="large"
            >
              Opzioni
            </Button>
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
        </Box>

        {/* Pannello Opzioni di Generazione */}
        <Collapse in={showGenerationOptions} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Opzioni di Generazione
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configura le opzioni per personalizzare la generazione delle categorie
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={generationOptions.unisciAttivitaComplementari}
                  onChange={() => handleToggleGenerationOption('unisciAttivitaComplementari')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Unisci atleti nelle attività complementari</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Raggruppa atleti di diversi tipi nella stessa categoria
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={generationOptions.unisciLivelloEsperienza}
                  onChange={() => handleToggleGenerationOption('unisciLivelloEsperienza')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Unisci categorie per livello esperienza</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Raggruppa atleti di diversi livelli di esperienza nella stessa categoria
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowGenerationOptions(false)}
            >
              Chiudi
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {/* Categorie Generate (Prima del salvataggio) */}
      {isGenerated && generatedCategories.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Anteprima Categorie Generate ({generatedCategories.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isMergeMode ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<MergeType />}
                    onClick={handleOpenMerge}
                  >
                    Unisci
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelCategories}
                    disabled={loading}
                  >
                    Annulla Categorie
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveCategories}
                    disabled={loading}
                  >
                    Salva Categorie
                  </Button>
                </>
              ) : (
                <>
                  <Chip 
                    label={`${selectedForMerge.length} categorie selezionate`} 
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleCancelMerge}
                  >
                    Annulla Unione
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleConfirmMerge}
                    disabled={selectedForMerge.length < 2}
                  >
                    Conferma Unione
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Queste categorie non sono ancora state salvate. Puoi modificarle, unirle o dividerle prima di confermare.
          </Alert>

          {/* Filtri per categorie generate */}
          <Paper elevation={0} sx={{ py: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Gruppo Età</InputLabel>
                  <Select
                    value={filters.gruppoEtaId}
                    onChange={(e) => handleFilterChange('gruppoEtaId', e.target.value)}
                    label="Gruppo Età"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {allGruppiEta.map((gruppo) => (
                      <MenuItem key={gruppo.id} value={gruppo.id}>
                        {gruppo.nome} ({gruppo.etaMinima}-{gruppo.etaMassima} anni)
                      </MenuItem>
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
            <Grid container spacing={2}>
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
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Gruppo Età</InputLabel>
                  <Select
                    value={filters.gruppoEtaId}
                    onChange={(e) => handleFilterChange('gruppoEtaId', e.target.value)}
                    label="Gruppo Età"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {allGruppiEta.map((gruppo) => (
                      <MenuItem key={gruppo.id} value={gruppo.id}>
                        {gruppo.nome} ({gruppo.etaMinima}-{gruppo.etaMassima} anni)
                      </MenuItem>
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
      <Dialog open={mergeDialog.open} onClose={() => setMergeDialog({ open: false, mergedName: '' })}>
        <DialogTitle>Unisci Categorie Selezionate</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Stai per unire {selectedForMerge.length} categorie:
          </Typography>
          
          <List dense>
            {selectedForMerge.map((nome, idx) => {
              const cat = generatedCategories.find(c => c.nome === nome);
              return (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={nome}
                    secondary={`${cat?.atleti?.length || 0} atleti`}
                  />
                </ListItem>
              );
            })}
          </List>

          <TextField
            fullWidth
            label="Nome Categoria Unita"
            value={mergeDialog.mergedName}
            onChange={(e) => setMergeDialog({ ...mergeDialog, mergedName: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Inserisci il nome per la nuova categoria che conterrà tutti gli atleti"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialog({ open: false, mergedName: '' })}>
            Annulla
          </Button>
          <Button onClick={handleMerge} variant="contained">
            Unisci
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Dividi - Nuovo Componente */}
      <CategorySplit
        open={splitDialog.open}
        onClose={() => setSplitDialog({ open: false, categoria: null })}
        categoria={splitDialog.categoria}
        onSplit={handleSplit}
      />
    </Container>
  );
};

export default CategoryDefinition;
