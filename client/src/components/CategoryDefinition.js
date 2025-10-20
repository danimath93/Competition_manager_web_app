import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
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
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  MergeType,
  CallSplit,
  SwapHoriz,
  Save,
  Refresh
} from '@mui/icons-material';
import {
  generateCategories,
  saveCategories,
  getCategoriesByCompetizione,
  deleteCategoria,
  mergeCategorie,
  splitCategoria,
  moveAtleti
} from '../api/categories';
import { getGruppiEta } from '../api/categories';
import { loadCompetitionCategories } from '../api/competitions';

const CategoryDefinition = ({ competizioneId, competition }) => {
  const [tipoCategoriaId, setTipoCategoriaId] = useState('');
  const [tipiCategoria, setTipiCategoria] = useState([]);
  const [gruppiEta, setGruppiEta] = useState([]);
  const [selectedGruppoEta, setSelectedGruppoEta] = useState('');
  const [selectedGenere, setSelectedGenere] = useState('U');
  const [selectedGrado, setSelectedGrado] = useState('misto');
  
  const [generatedCategories, setGeneratedCategories] = useState([]);
  const [savedCategories, setSavedCategories] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [editDialog, setEditDialog] = useState({ open: false, categoria: null });
  const [mergeDialog, setMergeDialog] = useState({ open: false, categoria1: null, categoria2: null });
  const [splitDialog, setSplitDialog] = useState({ open: false, categoria: null, atleti1: [], atleti2: [] });
  const [moveDialog, setMoveDialog] = useState({ open: false, atleti: [], fromCategoria: null, toCategoria: null });

  useEffect(() => {
    loadTipiCategoria();
    loadGruppiEta();
    loadExistingCategories();
  }, [competizioneId]);

  const loadTipiCategoria = async () => {
    try {
      const data = await loadCompetitionCategories(competizioneId);
      setTipiCategoria(data);
      if (data.length > 0) {
        setTipoCategoriaId(data[0].id);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei tipi categoria:', error);
    }
  };

  const loadGruppiEta = async () => {
    try {
      const data = await getGruppiEta();
      setGruppiEta(data);
      if (data.length > 0) {
        setSelectedGruppoEta(data[0].id);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei gruppi età:', error);
    }
  };

  const loadExistingCategories = async () => {
    try {
      const data = await getCategoriesByCompetizione(competizioneId);
      setSavedCategories(data);
    } catch (error) {
      console.error('Errore nel caricamento delle categorie esistenti:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedGruppoEta || !tipoCategoriaId) {
      setError('Seleziona un gruppo età e una tipologia di categoria');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await generateCategories(competizioneId, {
        gruppoEtaId: selectedGruppoEta,
        genere: selectedGenere,
        grado: selectedGrado,
        tipoCategoriaId: tipoCategoriaId
      });

      setGeneratedCategories(response.categorie);
      setIsGenerated(true);
      setSuccess(`Generate ${response.totaleCategorie} categorie con ${response.totaleAtleti} atleti totali`);
    } catch (error) {
      console.error('Errore nella generazione:', error);
      setError(error.response?.data?.message || 'Errore nella generazione delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (generatedCategories.length === 0) {
      setError('Nessuna categoria da salvare');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await saveCategories(competizioneId, {
        categorie: generatedCategories,
        tipoCategoriaId: tipoCategoriaId
      });

      setSuccess('Categorie salvate con successo!');
      setIsGenerated(false);
      setGeneratedCategories([]);
      await loadExistingCategories();
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
    try {
      await deleteCategoria(categoriaId);
      setSuccess('Categoria eliminata con successo');
      await loadExistingCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Errore nell\'eliminazione della categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategoria = (categoria) => {
    setEditDialog({ open: true, categoria: { ...categoria } });
  };

  const handleSaveEdit = () => {
    const { categoria } = editDialog;
    
    if (isGenerated) {
      // Modifica in memoria prima del salvataggio
      const updated = generatedCategories.map(cat => 
        cat.nome === editDialog.originalNome ? categoria : cat
      );
      setGeneratedCategories(updated);
    }
    
    setEditDialog({ open: false, categoria: null });
    setSuccess('Categoria modificata');
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
      // Unisci in memoria
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
    } else {
      // TODO: Implementa merge per categorie salvate
      setError('Funzionalità in fase di sviluppo per categorie salvate');
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
      setSplitDialog({ open: false, categoria: null, atleti1: [], atleti2: [] });
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

  const renderCategoriaCard = (categoria, index) => {
    const isGeneratedCard = isGenerated;
    
    return (
      <Grid item xs={12} md={6} lg={4} key={index}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {categoria.nome}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`Genere: ${categoria.genere}`} 
                size="small" 
                sx={{ mr: 1, mb: 1 }} 
              />
              {categoria.grado && (
                <Chip 
                  label={`Grado: ${categoria.grado}`} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              )}
              <Chip 
                label={`${isGeneratedCard ? categoria.atleti.length : categoria.iscrizioni?.length || 0} atleti`} 
                size="small" 
                color="primary"
                sx={{ mb: 1 }} 
              />
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Atleti:
            </Typography>
            <Box sx={{ maxHeight: 150, overflow: 'auto', mt: 1 }}>
              {(isGeneratedCard ? categoria.atleti : categoria.iscrizioni || []).map((item, idx) => {
                const atleta = isGeneratedCard ? item : item.atleta;
                return (
                  <Typography key={idx} variant="body2" sx={{ fontSize: '0.85rem' }}>
                    • {atleta.nome} {atleta.cognome} {atleta.peso ? `(${atleta.peso}kg)` : ''}
                  </Typography>
                );
              })}
            </Box>
          </CardContent>
          <CardActions>
            {isGeneratedCard ? (
              <>
                <IconButton size="small" onClick={() => handleEditCategoria(categoria)}>
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
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton size="small" onClick={() => handleEditCategoria(categoria)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(categoria.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
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

      {/* Configurazione Generazione */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configurazione Generazione Categorie
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipologia Categoria</InputLabel>
              <Select
                value={tipoCategoriaId}
                onChange={(e) => setTipoCategoriaId(e.target.value)}
                label="Tipologia Categoria"
              >
                {tipiCategoria.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Gruppo Età</InputLabel>
              <Select
                value={selectedGruppoEta}
                onChange={(e) => setSelectedGruppoEta(e.target.value)}
                label="Gruppo Età"
              >
                {gruppiEta.map((gruppo) => (
                  <MenuItem key={gruppo.id} value={gruppo.id}>
                    {gruppo.nome} ({gruppo.etaMinima}-{gruppo.etaMassima} anni)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Genere</InputLabel>
              <Select
                value={selectedGenere}
                onChange={(e) => setSelectedGenere(e.target.value)}
                label="Genere"
              >
                <MenuItem value="U">Misto</MenuItem>
                <MenuItem value="M">Maschile</MenuItem>
                <MenuItem value="F">Femminile</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Grado</InputLabel>
              <Select
                value={selectedGrado}
                onChange={(e) => setSelectedGrado(e.target.value)}
                label="Grado"
              >
                <MenuItem value="misto">Misto</MenuItem>
                <MenuItem value="bianca">Bianca</MenuItem>
                <MenuItem value="gialla">Gialla</MenuItem>
                <MenuItem value="arancione">Arancione</MenuItem>
                <MenuItem value="verde">Verde</MenuItem>
                <MenuItem value="blu">Blu</MenuItem>
                <MenuItem value="marrone">Marrone</MenuItem>
                <MenuItem value="nera">Nera</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              onClick={handleGenerate}
              disabled={loading || !selectedGruppoEta || !tipoCategoriaId}
              fullWidth
            >
              Genera Categorie
            </Button>
          </Grid>
        </Grid>
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
                onClick={handleSave}
                disabled={loading}
              >
                Salva Categorie
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Queste categorie non sono ancora state salvate. Puoi modificarle, unirle o dividerle prima di confermare.
          </Alert>

          <Grid container spacing={2}>
            {generatedCategories.map((categoria, index) => renderCategoriaCard(categoria, index))}
          </Grid>
        </Paper>
      )}

      {/* Categorie Salvate */}
      {savedCategories.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Categorie Salvate ({savedCategories.length})
          </Typography>
          
          <Grid container spacing={2}>
            {savedCategories.map((categoria, index) => renderCategoriaCard(categoria, index))}
          </Grid>
        </Paper>
      )}

      {/* Dialog Modifica */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, categoria: null })}>
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
          <Button onClick={() => setEditDialog({ open: false, categoria: null })}>
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
                  {cat.nome} ({cat.atleti.length} atleti)
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
                  {cat.nome} ({cat.atleti.length} atleti)
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
        onClose={() => setSplitDialog({ open: false, categoria: null, atleti1: [], atleti2: [] })}
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
                {splitDialog.categoria?.atleti.map((atleta) => (
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
                {splitDialog.categoria?.atleti.map((atleta) => (
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
          <Button onClick={() => setSplitDialog({ open: false, categoria: null, atleti1: [], atleti2: [] })}>
            Annulla
          </Button>
          <Button onClick={handleSplit} variant="contained">
            Dividi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryDefinition;
