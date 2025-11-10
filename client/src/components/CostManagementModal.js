import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Paper,
  Chip,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Euro as EuroIcon } from '@mui/icons-material';
import { loadAthleteTypes } from '../api/config';

const steps = [
  'Costi Speciali',
  'Configurazione Costi per Tipo Atleta',
  'Riepilogo'
];

const CostManagementModal = ({ open, onClose, value, onChange }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [athleteTypes, setAthleteTypes] = useState([]);
  
  // Stato locale per la gestione dei costi
  const [specialCosts, setSpecialCosts] = useState({});
  const [athleteCostConfigs, setAthleteCostConfigs] = useState([]);
  
  // Stato per nuovo costo speciale
  const [newSpecialName, setNewSpecialName] = useState('');
  const [newSpecialCost, setNewSpecialCost] = useState('');

  // Carica tipi atleta
  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await loadAthleteTypes();
        setAthleteTypes(types);
      } catch (error) {
        console.error('Errore nel caricamento tipi atleta:', error);
      }
    };
    loadData();
  }, []);

  // Inizializza i valori dal prop value
  useEffect(() => {
    if (value && open) {
      setSpecialCosts(value.specials || {});
      setAthleteCostConfigs(value.categories || []);
    } else if (open) {
      // Reset allo stato iniziale
      setSpecialCosts({});
      setAthleteCostConfigs([]);
      setActiveStep(0);
    }
  }, [value, open]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddSpecialCost = () => {
    if (newSpecialName && newSpecialCost && parseFloat(newSpecialCost) >= 0) {
      setSpecialCosts({
        ...specialCosts,
        [newSpecialName]: parseFloat(newSpecialCost)
      });
      setNewSpecialName('');
      setNewSpecialCost('');
    }
  };

  const handleRemoveSpecialCost = (key) => {
    const updated = { ...specialCosts };
    delete updated[key];
    setSpecialCosts(updated);
  };

  const handleAddAthleteConfig = () => {
    const newConfig = {
      idConfigTipoAtleta: null,
      type: 'fixed',
      config: { amount: 0 }
    };
    setAthleteCostConfigs([...athleteCostConfigs, newConfig]);
  };

  const handleRemoveAthleteConfig = (index) => {
    const updated = [...athleteCostConfigs];
    updated.splice(index, 1);
    setAthleteCostConfigs(updated);
  };

  const handleAthleteConfigChange = (index, field, value) => {
    const updated = [...athleteCostConfigs];
    
    if (field === 'idConfigTipoAtleta') {
      updated[index].idConfigTipoAtleta = parseInt(value);
    } else if (field === 'type') {
      updated[index].type = value;
      // Reset config based on type
      if (value === 'fixed') {
        updated[index].config = { amount: 0 };
      } else if (value === 'minimum') {
        updated[index].config = { minCategories: [1], costs: [0] };
      } else if (value === 'additional') {
        updated[index].config = { first: 0, extra: 0 };
      }
    }
    
    setAthleteCostConfigs(updated);
  };

  const handleConfigValueChange = (index, configField, value) => {
    const updated = [...athleteCostConfigs];
    updated[index].config[configField] = parseFloat(value) || 0;
    setAthleteCostConfigs(updated);
  };

  const handleMinimumConfigChange = (index, scaglioneIndex, field, value) => {
    const updated = [...athleteCostConfigs];
    const config = updated[index].config;
    
    if (field === 'minCategories') {
      config.minCategories[scaglioneIndex] = parseInt(value) || 1;
    } else if (field === 'costs') {
      config.costs[scaglioneIndex] = parseFloat(value) || 0;
    }
    
    setAthleteCostConfigs(updated);
  };

  const handleAddScaglione = (index) => {
    const updated = [...athleteCostConfigs];
    const config = updated[index].config;
    const lastMin = config.minCategories[config.minCategories.length - 1] || 1;
    
    config.minCategories.push(lastMin + 1);
    config.costs.push(0);
    
    setAthleteCostConfigs(updated);
  };

  const handleRemoveScaglione = (index, scaglioneIndex) => {
    const updated = [...athleteCostConfigs];
    const config = updated[index].config;
    
    config.minCategories.splice(scaglioneIndex, 1);
    config.costs.splice(scaglioneIndex, 1);
    
    setAthleteCostConfigs(updated);
  };

  const handleSave = () => {
    const costiIscrizione = {
      specials: specialCosts,
      categories: athleteCostConfigs.filter(config => config.idConfigTipoAtleta !== null)
    };
    onChange(costiIscrizione);
    onClose();
  };

  const getAthleteTypeName = (id) => {
    const type = athleteTypes.find(t => t.id === id);
    return type ? type.nome : 'Non selezionato';
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Aggiungi costi fissi che verranno applicati a tutti gli atleti (es. assicurazione, tassa gara, ecc.)
            </Typography>
            
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="Nome Costo"
                value={newSpecialName}
                onChange={(e) => setNewSpecialName(e.target.value)}
                size="small"
                placeholder="es. Assicurazione"
              />
              <TextField
                label="Importo (€)"
                value={newSpecialCost}
                onChange={(e) => setNewSpecialCost(e.target.value)}
                type="number"
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSpecialCost}
                disabled={!newSpecialName || !newSpecialCost}
              >
                Aggiungi
              </Button>
            </Box>

            {Object.keys(specialCosts).length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Costi Speciali Configurati:
                </Typography>
                {Object.entries(specialCosts).map(([key, value]) => (
                  <Box key={key} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography>
                      {key}: <strong>{value.toFixed(2)} €</strong>
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => handleRemoveSpecialCost(key)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                Configura i costi per ogni tipo di atleta
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddAthleteConfig}
                size="small"
              >
                Aggiungi Tipo Atleta
              </Button>
            </Box>

            {athleteCostConfigs.map((config, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">
                    Configurazione {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveAthleteConfig(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <FormLabel>Tipo Atleta</FormLabel>
                      <RadioGroup
                        value={config.idConfigTipoAtleta || ''}
                        onChange={(e) => handleAthleteConfigChange(index, 'idConfigTipoAtleta', e.target.value)}
                      >
                        {athleteTypes.map((type) => (
                          <FormControlLabel
                            key={type.id}
                            value={type.id}
                            control={<Radio />}
                            label={type.nome}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <FormLabel>Modalità di Calcolo</FormLabel>
                      <RadioGroup
                        value={config.type}
                        onChange={(e) => handleAthleteConfigChange(index, 'type', e.target.value)}
                      >
                        <FormControlLabel
                          value="fixed"
                          control={<Radio />}
                          label="Fisso - Costo unico indipendentemente dalle categorie"
                        />
                        <FormControlLabel
                          value="minimum"
                          control={<Radio />}
                          label="Scaglioni - Costo variabile per scaglioni di categorie"
                        />
                        <FormControlLabel
                          value="additional"
                          control={<Radio />}
                          label="Addizionale - Costo fisso + extra per ogni categoria aggiuntiva"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {config.type === 'fixed' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Importo Fisso (€)"
                        type="number"
                        value={config.config.amount || 0}
                        onChange={(e) => handleConfigValueChange(index, 'amount', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                        size="small"
                      />
                    </Grid>
                  )}

                  {config.type === 'minimum' && (
                    <Grid item xs={12}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2">Scaglioni</Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddScaglione(index)}
                          >
                            Aggiungi Scaglione
                          </Button>
                        </Box>
                        {config.config.minCategories?.map((minCat, scagIdx) => (
                          <Box key={scagIdx} display="flex" gap={1} mb={1} alignItems="center">
                            <TextField
                              label="Da N Categorie"
                              type="number"
                              value={minCat}
                              onChange={(e) => handleMinimumConfigChange(index, scagIdx, 'minCategories', e.target.value)}
                              inputProps={{ min: 1 }}
                              size="small"
                              sx={{ width: '150px' }}
                            />
                            <TextField
                              label="Costo (€)"
                              type="number"
                              value={config.config.costs[scagIdx] || 0}
                              onChange={(e) => handleMinimumConfigChange(index, scagIdx, 'costs', e.target.value)}
                              inputProps={{ min: 0, step: 0.01 }}
                              size="small"
                              sx={{ width: '150px' }}
                            />
                            {scagIdx > 0 && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveScaglione(index, scagIdx)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {config.type === 'additional' && (
                    <>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Prima Categoria (€)"
                          type="number"
                          value={config.config.first || 0}
                          onChange={(e) => handleConfigValueChange(index, 'first', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Ogni Categoria Extra (€)"
                          type="number"
                          value={config.config.extra || 0}
                          onChange={(e) => handleConfigValueChange(index, 'extra', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          size="small"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            ))}

            {athleteCostConfigs.length === 0 && (
              <Alert severity="info">
                Nessuna configurazione costi atleta. Clicca "Aggiungi Tipo Atleta" per iniziare.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Riepilogo Configurazione Costi
            </Typography>

            {Object.keys(specialCosts).length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <EuroIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Costi Speciali
                </Typography>
                <Divider sx={{ my: 1 }} />
                {Object.entries(specialCosts).map(([key, value]) => (
                  <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                    • {key}: <strong>{value.toFixed(2)} €</strong>
                  </Typography>
                ))}
              </Paper>
            )}

            {athleteCostConfigs.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <EuroIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Configurazioni per Tipo Atleta
                </Typography>
                <Divider sx={{ my: 1 }} />
                {athleteCostConfigs.map((config, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {getAthleteTypeName(config.idConfigTipoAtleta)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Modalità: <Chip label={
                        config.type === 'fixed' ? 'Fisso' :
                        config.type === 'minimum' ? 'Scaglioni' :
                        'Addizionale'
                      } size="small" />
                    </Typography>
                    {config.type === 'fixed' && (
                      <Typography variant="body2">
                        Costo: {config.config.amount?.toFixed(2)} €
                      </Typography>
                    )}
                    {config.type === 'minimum' && (
                      <Typography variant="body2">
                        Scaglioni: {config.config.minCategories?.map((min, i) => 
                          `${min}+ cat. → ${config.config.costs[i]?.toFixed(2)}€`
                        ).join(' | ')}
                      </Typography>
                    )}
                    {config.type === 'additional' && (
                      <Typography variant="body2">
                        Prima: {config.config.first?.toFixed(2)}€ + Extra: {config.config.extra?.toFixed(2)}€
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            )}

            {Object.keys(specialCosts).length === 0 && athleteCostConfigs.length === 0 && (
              <Alert severity="warning">
                Nessuna configurazione costi impostata
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Gestione Costi Iscrizione
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSave : handleNext}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Salva' : 'Avanti'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                  >
                    Indietro
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostManagementModal;
