import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Close,
  Sort,
} from '@mui/icons-material';

const CategorySplit = ({ open, onClose, categoria, onSplit }) => {
  const [leftAthletes, setLeftAthletes] = useState([]);
  const [rightAthletes, setRightAthletes] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('alphabetical');
  const [selectedLeftAthletes, setSelectedLeftAthletes] = useState([]);
  const [selectedRightAthletes, setSelectedRightAthletes] = useState([]);
  const [nome1, setNome1] = useState('');
  const [nome2, setNome2] = useState('');

  // Filtri per selezione multipla
  const [bornYearFilter, setBornYearFilter] = useState('');
  const [weightFilter, setWeightFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  // Effetto per inizializzare/resettare lo stato quando la categoria cambia o il dialog si apre
  useEffect(() => {
    if (open && categoria) {
      setLeftAthletes(categoria.atleti || []);
      setRightAthletes([]);
      setSelectedLeftAthletes([]);
      setSelectedRightAthletes([]);
      setNome1(`${categoria.nome}_A`);
      setNome2(`${categoria.nome}_B`);
      setSortCriteria('alphabetical');
      setBornYearFilter('');
      setWeightFilter('');
      setExperienceFilter('');
    }
  }, [open, categoria]);

  // Calcola età atleta
  const calculateBornYear = (dataNascita) => {
    if (!dataNascita) return null;
    const date = new Date(dataNascita);
    return isNaN(date.getFullYear()) ? null : date.getFullYear();
  };

  // Ottieni liste uniche per filtri
  const uniqueBornYears = useMemo(() => {
    const years = new Set();
    [...leftAthletes, ...rightAthletes].forEach(atleta => {
      const bornYear = calculateBornYear(atleta.dataNascita);
      if (bornYear) years.add(bornYear);
    });
    return Array.from(years).sort((a, b) => b - a); // Ordinamento decrescente
  }, [leftAthletes, rightAthletes]);

  const uniqueWeights = useMemo(() => {
    const weights = new Set();
    [...leftAthletes, ...rightAthletes].forEach(atleta => {
      if (atleta.peso) weights.add(atleta.peso);
    });
    return Array.from(weights).sort((a, b) => a - b);
  }, [leftAthletes, rightAthletes]);

  const uniqueExperiences = useMemo(() => {
    const experiences = new Set();
    [...leftAthletes, ...rightAthletes].forEach(atleta => {
      if (atleta.esperienza) experiences.add(atleta.esperienza);
    });
    return Array.from(experiences);
  }, [leftAthletes, rightAthletes]);

  // Ordina atleti in base al criterio selezionato
  const sortAthletes = (athletes) => {
    const sorted = [...athletes];
    
    switch (sortCriteria) {
      case 'alphabetical':
        return sorted.sort((a, b) => 
          `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`)
        );
      case 'bornYear':
        return sorted.sort((a, b) => 
          calculateBornYear(b.dataNascita) - calculateBornYear(a.dataNascita)
        ); // Decrescente (più recenti prima)
      case 'weight':
        return sorted.sort((a, b) => (a.peso || 0) - (b.peso || 0));
      case 'experience':
        return sorted.sort((a, b) => 
          (a.esperienza || '').localeCompare(b.esperienza || '')
        );
      default:
        return sorted;
    }
  };

  const sortedLeftAthletes = useMemo(() => sortAthletes(leftAthletes), [leftAthletes, sortCriteria]);
  const sortedRightAthletes = useMemo(() => sortAthletes(rightAthletes), [rightAthletes, sortCriteria]);

  // Sposta atleta da sinistra a destra
  const moveToRight = (atleta) => {
    setLeftAthletes(prev => prev.filter(a => a.id !== atleta.id));
    setRightAthletes(prev => [...prev, atleta]);
    setSelectedLeftAthletes(prev => prev.filter(id => id !== atleta.id));
  };

  // Sposta atleta da destra a sinistra
  const moveToLeft = (atleta) => {
    setRightAthletes(prev => prev.filter(a => a.id !== atleta.id));
    setLeftAthletes(prev => [...prev, atleta]);
    setSelectedRightAthletes(prev => prev.filter(id => id !== atleta.id));
  };

  // Sposta atleti selezionati
  const moveSelectedToRight = () => {
    const toMove = leftAthletes.filter(a => selectedLeftAthletes.includes(a.id));
    setLeftAthletes(prev => prev.filter(a => !selectedLeftAthletes.includes(a.id)));
    setRightAthletes(prev => [...prev, ...toMove]);
    setSelectedLeftAthletes([]);
  };

  const moveSelectedToLeft = () => {
    const toMove = rightAthletes.filter(a => selectedRightAthletes.includes(a.id));
    setRightAthletes(prev => prev.filter(a => !selectedRightAthletes.includes(a.id)));
    setLeftAthletes(prev => [...prev, ...toMove]);
    setSelectedRightAthletes([]);
  };

  // Selezione multipla per caratteristica
  const selectByBornYear = (year) => {
    if (!year) {
      setSelectedLeftAthletes([]);
      return;
    }
    const yearNum = parseInt(year);
    const toSelect = leftAthletes
      .filter(a => calculateBornYear(a.dataNascita) === yearNum)
      .map(a => a.id);
    setSelectedLeftAthletes(toSelect);
  };

  const selectByWeight = (weight) => {
    if (!weight) {
      setSelectedLeftAthletes([]);
      return;
    }
    const weightNum = parseFloat(weight);
    const toSelect = leftAthletes
      .filter(a => a.peso === weightNum)
      .map(a => a.id);
    setSelectedLeftAthletes(toSelect);
  };

  const selectByExperience = (experience) => {
    if (!experience) {
      setSelectedLeftAthletes([]);
      return;
    }
    const toSelect = leftAthletes
      .filter(a => a.esperienza === experience)
      .map(a => a.id);
    setSelectedLeftAthletes(toSelect);
  };

  // Toggle selezione atleta
  const toggleLeftSelection = (atletaId) => {
    setSelectedLeftAthletes(prev => 
      prev.includes(atletaId) 
        ? prev.filter(id => id !== atletaId)
        : [...prev, atletaId]
    );
  };

  const toggleRightSelection = (atletaId) => {
    setSelectedRightAthletes(prev => 
      prev.includes(atletaId) 
        ? prev.filter(id => id !== atletaId)
        : [...prev, atletaId]
    );
  };

  // Conferma divisione
  const handleConfirmSplit = () => {
    if (leftAthletes.length === 0 || rightAthletes.length === 0) {
      alert('Entrambe le categorie devono avere almeno un atleta');
      return;
    }

    if (!nome1.trim() || !nome2.trim()) {
      alert('Inserisci i nomi per entrambe le categorie');
      return;
    }

    onSplit({
      categoria1: {
        ...categoria,
        nome: nome1.trim(),
        atleti: leftAthletes
      },
      categoria2: {
        ...categoria,
        nome: nome2.trim(),
        atleti: rightAthletes
      }
    });

    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const renderAthleteItem = (atleta, side) => {
    const bornYear = calculateBornYear(atleta.dataNascita);
    const isSelected = side === 'left' 
      ? selectedLeftAthletes.includes(atleta.id)
      : selectedRightAthletes.includes(atleta.id);

    return (
      <ListItem
        key={atleta.id}
        disablePadding
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <ListItemButton
          onClick={() => {
            if (side === 'left') {
              toggleLeftSelection(atleta.id);
            } else {
              toggleRightSelection(atleta.id);
            }
          }}
          onDoubleClick={() => {
            if (side === 'left') {
              moveToRight(atleta);
            } else {
              moveToLeft(atleta);
            }
          }}
          sx={{ py: 1, px: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Checkbox visivo */}
            <Box
              sx={{
                width: 20,
                height: 20,
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'grey.400',
                borderRadius: '4px',
                bgcolor: isSelected ? 'primary.main' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0
              }}
            >
              {isSelected && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: 'white',
                    borderRadius: '2px'
                  }}
                />
              )}
            </Box>

            {/* Dati atleta in colonne */}
            <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ flex: '1 1 40%', fontWeight: isSelected ? 600 : 400 }}
              >
                {atleta.cognome} {atleta.nome}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ flex: '0 0 80px', textAlign: 'center', color: 'text.secondary' }}
              >
                {bornYear || '-'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ flex: '0 0 60px', textAlign: 'center', color: 'text.secondary' }}
              >
                {atleta.peso || '-'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ flex: '1 1 30%', color: 'text.secondary' }}
              >
                {atleta.esperienza || '-'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ flex: '1 1 30%', color: 'text.secondary' }}
              >
                {atleta.club?.abbreviazione || atleta.club?.denominazione || '-'}
              </Typography>
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Dividi Categoria: {categoria?.nome}
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Controlli ordinamento e filtri */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <Sort fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Ordinamento e Filtri
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            {/* Ordinamento */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Ordina per</InputLabel>
              <Select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                label="Ordina per"
              >
                <MenuItem value="alphabetical">Alfabetico</MenuItem>
                <MenuItem value="bornYear">Anno</MenuItem>
                <MenuItem value="weight">Peso</MenuItem>
                <MenuItem value="experience">Esperienza</MenuItem>
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            {/* Filtro Anno di Nascita */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtra per anno nascita</InputLabel>
              <Select
                value={bornYearFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setBornYearFilter(value);
                  setWeightFilter('');
                  setExperienceFilter('');
                  selectByBornYear(value);
                }}
                label="Filtra per anno nascita"
              >
                <MenuItem value="">Nessuno</MenuItem>
                {uniqueBornYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filtro Peso */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtra per peso</InputLabel>
              <Select
                value={weightFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setWeightFilter(value);
                  setBornYearFilter('');
                  setExperienceFilter('');
                  selectByWeight(value);
                }}
                label="Filtra per peso"
              >
                <MenuItem value="">Nessuno</MenuItem>
                {uniqueWeights.map(weight => (
                  <MenuItem key={weight} value={weight}>{weight} kg</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filtro Esperienza */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtra per esperienza</InputLabel>
              <Select
                value={experienceFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setExperienceFilter(value);
                  setBornYearFilter('');
                  setWeightFilter('');
                  selectByExperience(value);
                }}
                label="Filtra per esperienza"
              >
                <MenuItem value="">Nessuno</MenuItem>
                {uniqueExperiences.map(exp => (
                  <MenuItem key={exp} value={exp}>{exp}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Nomi categorie */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Nome Prima Categoria"
            value={nome1}
            onChange={(e) => setNome1(e.target.value)}
            size="small"
          />
          <TextField
            fullWidth
            label="Nome Seconda Categoria"
            value={nome2}
            onChange={(e) => setNome2(e.target.value)}
            size="small"
          />
        </Box>

        {/* Layout principale a 3 colonne */}
        <Box sx={{ display: 'flex', gap: 2, height: 'calc(90vh - 350px)' }}>
          {/* Colonna sinistra - Atleti originali */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ background: 'primary.main', color: 'white' }}>
                {nome1}
              </Typography>
              <Typography variant="caption">
                {leftAthletes.length} atleti
                {selectedLeftAthletes.length > 0 && ` (${selectedLeftAthletes.length} selezionati)`}
              </Typography>
            </Box>
            
            {/* Header colonne */}
            <Box sx={{ display: 'flex', gap: 2, px: 2, py: 1, bgcolor: 'grey.100', borderBottom: '2px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 20, flexShrink: 0 }} /> {/* Spazio per checkbox */}
              <Typography variant="caption" fontWeight={600} sx={{ flex: '1 1 40%' }}>
                ATLETA
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '0 0 80px', textAlign: 'center' }}>
                ANNO
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '0 0 60px', textAlign: 'center' }}>
                PESO
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '1 1 30%' }}>
                ESPERIENZA
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '1 1 30%' }}>
                CLUB
              </Typography>
            </Box>
            
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {sortedLeftAthletes.map(atleta => renderAthleteItem(atleta, 'left'))}
            </List>
          </Paper>

          {/* Colonna centrale - Controlli di spostamento */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, minWidth: 80 }}>
            <Button
              variant="contained"
              onClick={moveSelectedToRight}
              disabled={selectedLeftAthletes.length === 0}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              <ArrowForward />
            </Button>
            <Button
              variant="outlined"
              onClick={moveSelectedToLeft}
              disabled={selectedRightAthletes.length === 0}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              <ArrowBack />
            </Button>
            <Divider />
            <Typography variant="caption" align="center" color="text.secondary">
              Doppio clic per spostare
            </Typography>
          </Box>

          {/* Colonna destra - Nuova categoria */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'secondary.main', color: 'white' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ background: 'secondary.main', color: 'white' }}>
                {nome2}
              </Typography>
              <Typography variant="caption">
                {rightAthletes.length} atleti
                {selectedRightAthletes.length > 0 && ` (${selectedRightAthletes.length} selezionati)`}
              </Typography>
            </Box>
            
            {/* Header colonne */}
            <Box sx={{ display: 'flex', gap: 2, px: 2, py: 1, bgcolor: 'grey.100', borderBottom: '2px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 20, flexShrink: 0 }} /> {/* Spazio per checkbox */}
              <Typography variant="caption" fontWeight={600} sx={{ flex: '1 1 40%' }}>
                ATLETA
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '0 0 80px', textAlign: 'center' }}>
                ANNO NASC.
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '0 0 60px', textAlign: 'center' }}>
                PESO
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '1 1 30%' }}>
                ESPERIENZA
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ flex: '1 1 30%' }}>
                CLUB
              </Typography>
            </Box>
            
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {sortedRightAthletes.map(atleta => renderAthleteItem(atleta, 'right'))}
            </List>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Annulla
        </Button>
        <Button
          onClick={handleConfirmSplit}
          variant="contained"
          disabled={leftAthletes.length === 0 || rightAthletes.length === 0}
        >
          Conferma Divisione
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategorySplit;
