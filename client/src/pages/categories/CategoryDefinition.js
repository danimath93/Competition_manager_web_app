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
  TableRow
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
  saveCategories
} from '../../api/categories';

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

  const renderCategoriaCard = (categoria, index, isGeneratedCard) => {
    const cardKey = `${isGeneratedCard ? 'gen' : 'saved'}_${index}`;
    const isExpanded = expandedCards[cardKey] || false;
    const atleti = isGeneratedCard ? categoria.atleti : categoria.iscrizioni || [];
    
    return (
      <Card key={index}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {categoria.nome}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={`Genere: ${categoria.genere}`} 
                    size="small" 
                  />
                  {categoria.grado && (
                    <Chip 
                      label={`Grado: ${categoria.grado}`} 
                      size="small" 
                    />
                  )}
                  {categoria.gradoEta && (
                    <Chip 
                      label={`Grado Età: ${categoria.gradoEta}`} 
                      size="small" 
                      color="secondary"
                    />
                  )}
                  {categoria.livello && (
                    <Chip 
                      label={`Livello: ${categoria.livello}`} 
                      size="small" 
                      color="secondary"
                    />
                  )}
                  <Chip 
                    label={`${atleti.length} atleti`} 
                    size="small" 
                    color="primary"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
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

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Atleti Iscritti
              </Typography>
              {atleti.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Atleta</strong></TableCell>
                        <TableCell align="center"><strong>Peso (kg)</strong></TableCell>
                        <TableCell><strong>Club</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {atleti.map((item, idx) => {
                        const atleta = isGeneratedCard ? item : item.atleta;
                        const club = isGeneratedCard ? item.club : item.atleta?.club;
                        return (
                          <TableRow key={idx} hover>
                            <TableCell>
                              {atleta.nome} {atleta.cognome}
                            </TableCell>
                            <TableCell align="center">
                              {atleta.peso || item.peso || '-'}
                            </TableCell>
                            <TableCell>
                              {club?.denominazione || club?.nome || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessun atleta iscritto
                </Typography>
              )}
            </Collapse>
          </CardContent>
        </Card>
    );
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {generatedCategories.map((categoria, index) => renderCategoriaCard(categoria, index, true))}
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
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {categories.map((categoria, index) => renderCategoriaCard(categoria, index, false))}
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
