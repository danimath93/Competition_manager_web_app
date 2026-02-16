import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
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
import MuiButton from '@mui/material/Button';
import { ArrowBack, Refresh, Edit, Delete, CallSplit, MergeType, Save, ExpandMore, ExpandLess, Settings, Summarize } from '@mui/icons-material';
import { FaTags } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCompetitionDetails } from '../../api/competitions';
import {
  getCategoriesByCompetizione,
  deleteCategoria,
  deleteCategoriesByCompetition,
  generateCategories,
  saveCategories,
  updateCategoria,
  getGruppiEta
} from '../../api/categories';
import { loadAthleteTypes, loadAllCategoryTypes } from '../../api/config';
import CategorySplit from './CategorySplit';
import CategorySummaryModal from '../../components/CategorySummaryModal';
import PageHeader from '../../components/PageHeader';
import { CompetitionTipology } from '../../constants/enums/CompetitionEnums';
import Button from '../../components/common/Button';
import ConfirmActionModal from '../../components/common/ConfirmActionModal';

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
    nomeCategoria: '',
    genere: '',
    gruppoEtaId: ''
  });

  // Dialog states
  const [editDialog, setEditDialog] = useState({ open: false, categoria: null, originalNome: null });
  const [mergeDialog, setMergeDialog] = useState({ open: false, mergedName: '' });
  const [splitDialog, setSplitDialog] = useState({ open: false, categoria: null });
  
  // Confirm modals
  const [cancelCategoriesModal, setCancelCategoriesModal] = useState(false);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState({ open: false, categoriaId: null });
  const [saveSelectedModal, setSaveSelectedModal] = useState(false);
  const [deleteSelectedModal, setDeleteSelectedModal] = useState(false);
  const [deleteSelectedSavedModal, setDeleteSelectedSavedModal] = useState(false);
  
  // Selection states
  const [selectedGenCategories, setSelectedGenCategories] = useState([]);
  const [selectedSavedCategories, setSelectedSavedCategories] = useState([]);
  
  // Opzioni di generazione personalizzata
  const [showGenerationOptions, setShowGenerationOptions] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    unisciAttivitaComplementari: false,
    unisciLivelloEsperienza: false,
    utilizzaDateValiditaGruppiEta: false,
    utilizzaEtaAtletiInizioGara: false
  });

  // Modals for summary and print
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
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
        setError('Impossibile caricare i dati della competizione: ' + (error?.message || 'Errore sconosciuto'));
      } finally {
        setLoading(false);
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
    
    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }

    loadCompetitionData();
    loadConfigData();
  }, [competizioneId, user]);

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByCompetizione(competizioneId);
      setCategories(data);
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
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
      setError('Errore nella generazione delle categorie: ' + (error?.message || 'Errore sconosciuto'));
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
      setError('Errore nel salvataggio della categoria: ' + (error?.message || 'Errore sconosciuto'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCategories = () => {
    setCancelCategoriesModal(true);
  };

  const confirmCancelCategories = () => {
    setGeneratedCategories([]);
    setIsGenerated(false);
    setSuccess('Categorie generate annullate con successo');
    setCancelCategoriesModal(false);
  };

  const handleDelete = async (categoriaId) => {
    setDeleteCategoryModal({ open: true, categoriaId });
  };

  const confirmDeleteCategory = async () => {
    const { categoriaId } = deleteCategoryModal;
    setLoading(true);
    setError(null);
    setDeleteCategoryModal({ open: false, categoriaId: null });
    try {
      await deleteCategoria(categoriaId);
      setSuccess('Categoria eliminata con successo');
      await loadCategories();
    } catch (error) {
      setError('Errore nell\'eliminazione della categoria: ' + (error?.message || 'Errore sconosciuto'));
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

  const handleSaveEdit = async () => {
    const { categoria, originalNome, isGenerated: isGeneratedCard } = editDialog;
    
    if (isGeneratedCard) {
      const updated = generatedCategories.map(cat => 
        cat.nome === originalNome ? categoria : cat
      );
      setGeneratedCategories(updated);
      setSuccess('Categoria modificata');
    } else {
      const updated = categories.map(cat =>
        cat.nome === originalNome ? categoria : cat
      );

      try {
        await updateCategoria(categoria.id, categoria); 
        setCategories(updated);
      } catch (error) {
        setError('Errore nella modifica della categoria: ' + (error?.message || 'Errore sconosciuto'));
      }
    }

    setEditDialog({ open: false, categoria: null, originalNome: null });
  };

  const handleToggleGeneratedSelection = (categoriaKey) => {
    setSelectedGenCategories(prev => {
      if (prev.includes(categoriaKey)) {
        return prev.filter(key => key !== categoriaKey);
      } else {
        return [...prev, categoriaKey];
      }
    });
  };

  const handleToggleSavedSelection = (categoriaId) => {
    setSelectedSavedCategories(prev => {
      if (prev.includes(categoriaId)) {
        return prev.filter(id => id !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  const handleConfirmMerge = () => {
    if (selectedGenCategories.length < 2) {
      setError('Seleziona almeno due categorie da unire');
      return;
    }

    // Cerco la prima categoria per key e prendo il nome da usare come base per il merge
    const firstCategory = generatedCategories.find(c => c.key === selectedGenCategories[0]);
    const mergedName = (firstCategory ? firstCategory.nome : '') + '_Merged';

    setMergeDialog({ open: true, mergedName });
  };

  const handleSaveSelected = async () => {
    if (selectedGenCategories.length === 0) {
      setError('Seleziona almeno una categoria da salvare');
      return;
    }

    setSaveSelectedModal(true);
  };

  const confirmSaveSelected = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSaveSelectedModal(false);

    try {
      const categoriesToSave = generatedCategories.filter(c => selectedGenCategories.includes(c.key));
      
      // Prepara le categorie per il salvataggio
      const categoriesData = categoriesToSave.map(categoria => ({
        ...categoria,
        atleti: categoria.atleti.map(atleta => ({
          id: atleta.id,
          iscrizioneId: atleta.iscrizioneId
        }))
      }));

      await saveCategories(competizioneId, {
        categorie: categoriesData
      });

      // Rimuovi le categorie salvate dalla lista delle generate
      const updated = generatedCategories.filter(c => !selectedGenCategories.includes(c.key));
      setGeneratedCategories(updated);
      setSelectedGenCategories([]);
      
      // Se non ci sono più categorie generate, disattiva la modalità generata
      if (updated.length === 0) {
        setIsGenerated(false);
      }

      setSuccess(`${categoriesToSave.length} categoria/e salvata/e con successo!`);
      await loadCategories();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      setError('Errore nel salvataggio delle categorie: ' + (error?.message || 'Errore sconosciuto'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedGenCategories.length === 0) {
      setError('Seleziona almeno una categoria da eliminare');
      return;
    }

    setDeleteSelectedModal(true);
  };

  const confirmDeleteSelected = () => {
    const count = selectedGenCategories.length;
    const updated = generatedCategories.filter(c => !selectedGenCategories.includes(c.key));
    setGeneratedCategories(updated);
    setSelectedGenCategories([]);
    setSuccess(`${count} categoria/e eliminata/e con successo`);
    setDeleteSelectedModal(false);
    
    // Se non ci sono più categorie, disattiva la modalità generata
    if (updated.length === 0) {
      setIsGenerated(false);
    }
  };

  const handleDeleteSelectedSaved = async () => {
    if (selectedSavedCategories.length === 0) {
      setError('Seleziona almeno una categoria da eliminare');
      return;
    }

    setDeleteSelectedSavedModal(true);
  };

  const confirmDeleteSelectedSaved = async () => {
    const count = selectedSavedCategories.length;
    setLoading(true);
    setError(null);
    setDeleteSelectedSavedModal(false);

    try {
      // Elimina tutte le categorie selezionate
      await Promise.all(selectedSavedCategories.map(id => deleteCategoria(id)));
      
      setSelectedSavedCategories([]);
      setSuccess(`${count} categoria/e eliminata/e con successo`);
      await loadCategories();
    } catch (error) {
      setError('Errore nell\'eliminazione delle categorie: ' + (error?.message || 'Errore sconosciuto'));
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    const { mergedName } = mergeDialog;
    
    if (!mergedName || !mergedName.trim()) {
      setError('Inserisci un nome per la categoria unita');
      return;
    }

    if (isGenerated && selectedGenCategories.length >= 2) {
      const categoriesToMerge = generatedCategories.filter(c => selectedGenCategories.includes(c.key));
      
      // Unisci tutti gli atleti delle categorie selezionate
      const allAtleti = categoriesToMerge.reduce((acc, cat) => [...acc, ...cat.atleti], []);

      // Se le categorie hanno genere diverso, imposta il genere della categoria unita a 'U' (Unisex)
      const hasMixedGender = new Set(categoriesToMerge.map(c => c.genere)).size > 1;

      // Se le categorie hanno gruppi età diversi, unisci anche quelli (rimuovendo eventuali duplicati)
      const allGruppiEta = [...new Set(categoriesToMerge.flatMap(c => c.gruppiEtaId || []))];
      
      // Usa i dati della prima categoria selezionata come base
      const baseCategoria = categoriesToMerge[0];
      
      const merged = {
        ...baseCategoria,
        nome: mergedName.trim(),
        atleti: allAtleti,
        genere: hasMixedGender ? 'U' : baseCategoria.genere,
        gruppiEtaId: allGruppiEta
      };

      // Rimuovi tutte le categorie unite tranne la prima (che verrà sostituita)
      const updated = generatedCategories
        .filter(c => !selectedGenCategories.includes(c.key) || c.key === selectedGenCategories[0])
        .map(c => c.key === selectedGenCategories[0] ? merged : c);
      
      setGeneratedCategories(updated);
      setMergeDialog({ open: false, mergedName: '' });
      setSelectedGenCategories([]);
      setSuccess(`${selectedGenCategories.length} categorie unite con successo`);
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
        c.key === splitDialog.categoria.key ? categoria1 : c
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
      if (filters.nomeCategoria && !categoria.nome.toLowerCase().includes(filters.nomeCategoria.toLowerCase())) return false;
      if (filters.tipoAtletaId && !categoria?.tipiAtletaId?.includes(filters.tipoAtletaId)) return false;
      if (filters.tipoCategoriaId && categoria.tipoCategoriaId !== filters.tipoCategoriaId) return false;
      if (filters.genere && categoria.genere !== filters.genere) return false;
      if (filters.gruppoEtaId && !categoria?.gruppiEtaId?.includes(filters.gruppoEtaId)) return false;

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
    const isSelected = isGeneratedCard ? selectedGenCategories.includes(categoria.key) : selectedSavedCategories.includes(categoria.id);
    const tipoCompetizioneId = isGeneratedCard ? categoria.tipoCompetizioneId : categoria?.tipoCategoria?.tipoCompetizione?.id;
    const isQuyenCategory = tipoCompetizioneId === CompetitionTipology.MANI_NUDE || tipoCompetizioneId === CompetitionTipology.ARMI;
    const isFightCategory = tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO;

    const getBirthYear = (dataNascita) => {
      if (!dataNascita) return null;
      const date = new Date(dataNascita);
      return isNaN(date.getFullYear()) ? null : date.getFullYear();
    };
    
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
            {/* Titolo con checkbox sempre visibile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Checkbox
                checked={isSelected}
                onChange={() => isGeneratedCard ? handleToggleGeneratedSelection(categoria.key) : handleToggleSavedSelection(categoria.id)}
                size="small"
                sx={{ p: 0 }}
              />
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
                        <TableCell sx={{ fontSize: '0.75rem', py: 0, width: '30%' }}><strong>Atleta</strong></TableCell>
                        { isFightCategory ? (
                          <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0, width: '20%' }}><strong>Peso (kg)</strong></TableCell>
                        ) : (
                          <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0, width: '20%' }}><strong>Anno</strong></TableCell>
                        )}
                        { isQuyenCategory && (
                          <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0, width: '20%' }}><strong>Dettagli</strong></TableCell>
                        )}
                        <TableCell sx={{ fontSize: '0.75rem', py: 0, width: '20%' }}><strong>Esperienza</strong></TableCell>
                        <TableCell sx = {{ fontSize: '0.75rem', py: 0, width: '30%' }}><strong>Club</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {atleti.map((item, idx) => {
                        const atleta = isGeneratedCard ? item : item.atleta;
                        const club = isGeneratedCard ? item.club : item.atleta?.club;
                        const esperienza = isGeneratedCard ? item.esperienza : item.esperienza?.nome;
                        const dettagli = isGeneratedCard ? item.dettagli : item.dettagli?.nome;
                        return (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              <Tooltip title={`${atleta.cognome} ${atleta.nome}`} arrow placement="top">
                                <span>
                              {atleta.cognome} {atleta.nome ? `${atleta.nome.charAt(0)}.` : ''}
                                </span>
                              </Tooltip>
                            </TableCell>
                            { isFightCategory ? (
                              <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                {item.peso || '-'}
                              </TableCell>
                             ) : (
                              <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                {getBirthYear(atleta.dataNascita)}
                              </TableCell>
                              )
                            }
                            { isQuyenCategory && (
                              <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                {dettagli || '-'}
                              </TableCell>
                            )}
                            <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              {esperienza || '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              {club?.abbreviazione || club?.denominazione || '-'}
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
      <div className="page-container">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="page-container">
        <Alert severity="warning">Competizione non trovata</Alert>
        <MuiButton 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </MuiButton>
      </div>
    );
  }

  // Controllo permessi - mostra messaggio se l'utente non ha i permessi
  if (!hasPermission) {
    return (
      <div className="page-container">
        <Box sx={{ mb: 3 }}>
          <MuiButton 
            startIcon={<ArrowBack />} 
            onClick={handleGoBack}
            sx={{ mb: 2 }}
          >
            Torna a tutte le categorie
          </MuiButton>
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
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTags}
        title="Definizione Categorie"
        subtitle={`${competition.nome} - Organizzatore: ${competition.organizzatore?.denominazione || 'N/A'}`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna alle Competizioni
      </MuiButton>
    
      {/* Messaggi di errore e successo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message || error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Bottone Genera Categorie */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
        }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Generazione Categorie
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Genera automaticamente le categorie per questa competizione
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Button
              variant="outlined"
              icon={Settings}
              onClick={() => setShowGenerationOptions(!showGenerationOptions)}
              disabled={loading || isGenerated}
            >
              Opzioni
            </Button>
            <Button
              icon={loading ? CircularProgress: Refresh}
              onClick={handleGenerateCategories}
              disabled={loading || isGenerated}
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
            <FormControlLabel
              control={
                <Switch
                  checked={generationOptions.utilizzaDateValiditaGruppiEta}
                  onChange={() => handleToggleGenerationOption('utilizzaDateValiditaGruppiEta')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Utilizza date di validità dei gruppi di età</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Considera le date di validità dei gruppi di età per la generazione delle categorie
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={generationOptions.utilizzaEtaAtletiInizioGara}
                  onChange={() => handleToggleGenerationOption('utilizzaEtaAtletiInizioGara')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Utilizza età atleti all'inizio gara</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Considera l'età degli atleti all'inizio della gara per la generazione delle categorie
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <MuiButton
              variant="outlined"
              onClick={() => setShowGenerationOptions(false)}
            >
              Chiudi
            </MuiButton>
          </Box>
        </Collapse>

        {/* Categorie Generate (Prima del salvataggio) */}
        {isGenerated && generatedCategories.length > 0 && (
          <>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' },
              mb: 2, mt: 4
            }}>
              <Typography variant="h6">
                Anteprima Categorie Generate ({generatedCategories.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: { xs: 2, md: 0 } }}>
                {selectedGenCategories.length > 0 && (
                  <Chip 
                    label={`${selectedGenCategories.length} selezionate`} 
                    color="primary"
                    onDelete={() => setSelectedGenCategories([])}
                  />
                )}
                <MuiButton
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSaveSelected}
                  disabled={selectedGenCategories.length === 0 || loading}
                >
                  Salva
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  startIcon={<MergeType />}
                  onClick={handleConfirmMerge}
                  disabled={selectedGenCategories.length < 2}
                >
                  Unisci
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDeleteSelected}
                  disabled={selectedGenCategories.length === 0}
                >
                  Elimina
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="error"
                  onClick={handleCancelCategories}
                  disabled={loading}
                >
                  Annulla
                </MuiButton>
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
          </>
        )}
      </Paper>

      {/* Categorie Salvate */}
      {categories.length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 2
          }}>
            <Typography variant="h6">
              Categorie Salvate ({categories.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: { xs: 2, md: 0 } }}>
              {selectedSavedCategories.length > 0 && (
                <Chip 
                  label={`${selectedSavedCategories.length} selezionate`} 
                  color="primary"
                  onDelete={() => setSelectedSavedCategories([])}
                />
              )}
              <MuiButton
                variant="outlined"
                startIcon={<Summarize />}
                onClick={() => setShowSummaryModal(true)}
                disabled={loading}
              >
                Riepilogo
              </MuiButton>
              <MuiButton
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteSelectedSaved}
                disabled={selectedSavedCategories.length === 0 || loading}
              >
                Elimina
              </MuiButton>
            </Box>
          </Box>

          {/* Filtri per categorie salvate */}
          <Paper elevation={0} sx={{ py: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="name"
                  label="Cerca nome categoria"
                  placeholder="Inserisci categoria..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  margin="none"
                  value={filters.nomeCategoria}
                  onChange={(e) => handleFilterChange('nomeCategoria', e.target.value)}
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      height: '40px' 
                    }
                  }}
                />
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

          <Divider sx={{ mb: 2 }} />

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
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, categoria: null, originalNome: null })} maxWidth="sm" fullWidth>
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
          <MuiButton onClick={() => setEditDialog({ open: false, categoria: null, originalNome: null })}>
            Annulla
          </MuiButton>
          <MuiButton onClick={handleSaveEdit} variant="contained">
            Salva
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Dialog Unisci */}
      <Dialog open={mergeDialog.open} onClose={() => setMergeDialog({ open: false, mergedName: '' })}>
        <DialogTitle>Unisci Categorie Selezionate</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Stai per unire {selectedGenCategories.length} categorie:
          </Typography>
          
          <List dense>
            {selectedGenCategories.map((key, idx) => {
              const cat = generatedCategories.find(c => c.key === key);
              return (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={cat?.nome}
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
          <MuiButton onClick={() => setMergeDialog({ open: false, mergedName: '' })}>
            Annulla
          </MuiButton>
          <MuiButton onClick={handleMerge} variant="contained">
            Unisci
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Dialog Dividi - Nuovo Componente */}
      <CategorySplit
        open={splitDialog.open}
        onClose={() => setSplitDialog({ open: false, categoria: null })}
        categoria={splitDialog.categoria}
        onSplit={handleSplit}
      />

      {/* Category Summary Modal */}
      <CategorySummaryModal
        open={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        competitionId={competizioneId}
      />

      {/* Confirm Action Modals */}
      <ConfirmActionModal
        open={cancelCategoriesModal}
        title="Annulla Categorie Generate"
        message="Sei sicuro di voler annullare tutte le categorie generate? Questa azione non può essere annullata."
        primaryButton={{
          text: 'Annulla Categorie',
          onClick: confirmCancelCategories,
        }}
        secondaryButton={{
          text: 'Chiudi',
          onClick: () => setCancelCategoriesModal(false),
        }}
      />

      <ConfirmActionModal
        open={deleteCategoryModal.open}
        title="Elimina Categoria"
        message="Sei sicuro di voler eliminare questa categoria?"
        primaryButton={{
          text: 'Elimina',
          onClick: confirmDeleteCategory,
        }}
        secondaryButton={{
          text: 'Annulla',
          onClick: () => setDeleteCategoryModal({ open: false, categoriaId: null }),
        }}
      />

      <ConfirmActionModal
        open={saveSelectedModal}
        title="Salva Categorie Selezionate"
        message={`Sei sicuro di voler salvare ${selectedGenCategories.length} categoria/e selezionata/e?`}
        primaryButton={{
          text: 'Salva',
          onClick: confirmSaveSelected,
        }}
        secondaryButton={{
          text: 'Annulla',
          onClick: () => setSaveSelectedModal(false),
        }}
      />

      <ConfirmActionModal
        open={deleteSelectedModal}
        title="Elimina Categorie Selezionate"
        message={`Sei sicuro di voler eliminare ${selectedGenCategories.length} categoria/e selezionata/e? Questa azione non può essere annullata.`}
        primaryButton={{
          text: 'Elimina',
          onClick: confirmDeleteSelected,
        }}
        secondaryButton={{
          text: 'Annulla',
          onClick: () => setDeleteSelectedModal(false),
        }}
      />

      <ConfirmActionModal
        open={deleteSelectedSavedModal}
        title="Elimina Categorie Salvate"
        message={`Sei sicuro di voler eliminare ${selectedSavedCategories.length} categoria/e selezionata/e? Questa azione non può essere annullata.`}
        primaryButton={{
          text: 'Elimina',
          onClick: confirmDeleteSelectedSaved,
        }}
        secondaryButton={{
          text: 'Annulla',
          onClick: () => setDeleteSelectedSavedModal(false),
        }}
      />
    </div>
  );
};

export default CategoryDefinition;
