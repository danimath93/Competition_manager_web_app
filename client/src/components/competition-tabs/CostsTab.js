import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Paper,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { loadAthleteTypes } from '../../api/config';
import { TextInput } from '../common';
import Button from '../common/Button';
import '../styles/Layout.css';
import '../styles/Register.css';

const CostsTab = ({ value, onChange, onSubmit }) => {
  const [athleteTypes, setAthleteTypes] = useState([]);
  const [specialCosts, setSpecialCosts] = useState({});
  const [athleteCostConfigs, setAthleteCostConfigs] = useState([]);
  const [iban, setIban] = useState('');
  const [intestatario, setIntestatario] = useState('');
  const [causale, setCausale] = useState('');
  
  // Stati per modali
  const [specialCostModalOpen, setSpecialCostModalOpen] = useState(false);
  const [athleteConfigModalOpen, setAthleteConfigModalOpen] = useState(false);
  
  // Stato per nuovo costo speciale (nel modale)
  const [newSpecialName, setNewSpecialName] = useState('');
  const [newSpecialCost, setNewSpecialCost] = useState('');
  
  // Stato per nuova configurazione atleta (nel modale)
  const [newAthleteConfig, setNewAthleteConfig] = useState({
    idConfigTipoAtleta: null,
    type: 'fixed',
    config: { amount: 0 }
  });

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
    if (value) {
      setSpecialCosts(value.costiIscrizione?.specials || {});
      setAthleteCostConfigs(value.costiIscrizione?.categories || []);
      setIban(value.iban || '');
      setIntestatario(value.intestatario || '');
      setCausale(value.causale || '');
    }
  }, [value]);

  // Handler per costi speciali
  const handleAddSpecialCost = () => {
    if (newSpecialName && newSpecialCost && parseFloat(newSpecialCost) >= 0) {
      setSpecialCosts({
        ...specialCosts,
        [newSpecialName]: parseFloat(newSpecialCost)
      });
      setNewSpecialName('');
      setNewSpecialCost('');
      setSpecialCostModalOpen(false);
    }
  };

  const handleRemoveSpecialCost = (key) => {
    const updated = { ...specialCosts };
    delete updated[key];
    setSpecialCosts(updated);
  };

  // Handler per configurazioni atleta
  const handleRemoveAthleteConfig = (index) => {
    const updated = [...athleteCostConfigs];
    updated.splice(index, 1);
    setAthleteCostConfigs(updated);
  };

  const handleNewAthleteConfigChange = (field, value) => {
    const updated = { ...newAthleteConfig };
    
    if (field === 'idConfigTipoAtleta') {
      updated.idConfigTipoAtleta = parseInt(value);
    } else if (field === 'type') {
      updated.type = value;
      if (value === 'fixed') {
        updated.config = { amount: 0 };
      } else if (value === 'minimum') {
        updated.config = { minCategories: [1], costs: [0] };
      } else if (value === 'additional') {
        updated.config = { first: 0, extra: 0 };
      }
    }
    
    setNewAthleteConfig(updated);
  };

  const handleNewConfigValueChange = (configField, value) => {
    const updated = { ...newAthleteConfig };
    updated.config[configField] = parseFloat(value) || 0;
    setNewAthleteConfig(updated);
  };

  const handleNewMinimumConfigChange = (scaglioneIndex, field, value) => {
    const updated = { ...newAthleteConfig };
    const config = updated.config;
    
    if (field === 'minCategories') {
      config.minCategories[scaglioneIndex] = parseInt(value) || 1;
    } else if (field === 'costs') {
      config.costs[scaglioneIndex] = parseFloat(value) || 0;
    }
    
    setNewAthleteConfig(updated);
  };

  const handleAddScaglione = () => {
    const updated = { ...newAthleteConfig };
    const config = updated.config;
    const lastMin = config.minCategories[config.minCategories.length - 1] || 1;
    
    config.minCategories.push(lastMin + 1);
    config.costs.push(0);
    
    setNewAthleteConfig(updated);
  };

  const handleRemoveScaglione = (scaglioneIndex) => {
    const updated = { ...newAthleteConfig };
    const config = updated.config;
    
    config.minCategories.splice(scaglioneIndex, 1);
    config.costs.splice(scaglioneIndex, 1);
    
    setNewAthleteConfig(updated);
  };

  const handleSaveAthleteConfig = () => {
    // Verifica che non esista già una configurazione per questo tipo atleta
    const existingConfig = athleteCostConfigs.find(
      config => config.idConfigTipoAtleta === newAthleteConfig.idConfigTipoAtleta
    );
    
    if (existingConfig) {
      alert('Esiste già una configurazione per questo tipo di atleta');
      return;
    }
    
    if (newAthleteConfig.idConfigTipoAtleta !== null) {
      setAthleteCostConfigs([...athleteCostConfigs, { ...newAthleteConfig }]);
      setNewAthleteConfig({
        idConfigTipoAtleta: null,
        type: 'fixed',
        config: { amount: 0 }
      });
      setAthleteConfigModalOpen(false);
    }
  };

  const getAthleteTypeName = (id) => {
    const type = athleteTypes.find(t => t.id === id);
    return type ? type.nome : 'Non selezionato';
  };

  const getConfigTypeLabel = (type) => {
    switch (type) {
      case 'fixed': return 'Fisso';
      case 'minimum': return 'Scaglioni';
      case 'additional': return 'Addizionale';
      default: return type;
    }
  };

  const getConfigDescription = (config) => {
    if (config.type === 'fixed') {
      return `${config.config.amount?.toFixed(2)} €`;
    } else if (config.type === 'minimum') {
      return config.config.minCategories?.map((min, i) => 
        `${min}+ cat. → ${config.config.costs[i]?.toFixed(2)}€`
      ).join(' | ');
    } else if (config.type === 'additional') {
      return `Prima: ${config.config.first?.toFixed(2)}€ + Extra: ${config.config.extra?.toFixed(2)}€`;
    }
    return '';
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    const costiIscrizione = {
      specials: specialCosts,
      categories: athleteCostConfigs.filter(config => config.idConfigTipoAtleta !== null)
    };
    onChange(costiIscrizione, iban, intestatario, causale);
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <>
      <form onSubmit={handleSaveChanges} className="register-form">
        {/* Sezione 1: Informazioni Bonifico */}
        <h6 className="text-primary text-center register-section-title">Informazioni Bonifico</h6>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* IBAN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 500, color: '#333' }}>
                Inserisci l'IBAN a cui effettuare il bonifico <span style={{ color: 'red' }}>*</span>
              </label>
              <TextInput
                name="iban"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="IT00X0000000000000000000000"
                required
                size="small"
                fullWidth
              />
            </div>

            {/* Intestatario */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 500, color: '#333' }}>
                Inserisci l'intestatario del C/C a cui effettuare il bonifico <span style={{ color: 'red' }}>*</span>
              </label>
              <TextInput
                name="intestatario"
                value={intestatario}
                onChange={(e) => setIntestatario(e.target.value)}
                placeholder="Nome intestatario"
                required
                size="small"
                fullWidth
              />
            </div>

            {/* Causale */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 500, color: '#333' }}>
                Inserisci la causale del pagamento
              </label>
              <TextInput
                name="causale"
                value={causale}
                onChange={(e) => setCausale(e.target.value)}
                placeholder="Causale pagamento"
                size="small"
                fullWidth
              />
            </div>
          </div>
          </div>
        </div>

        {/* Sezione 2: Costi Speciali */}
        <h6 className="text-primary text-center register-section-title">Costi speciali</h6>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 500, color: '#333' }}>Aggiungi dei costi specifici da applicare agli atleti in determinate condizioni</label>
              <Button
                size='s'
                onClick={() => setSpecialCostModalOpen(true)}
              >
                Aggiungi
              </Button>
            </div>

            {Object.keys(specialCosts).length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                {Object.entries(specialCosts).map(([key, value]) => (
                  <div key={key} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem', 
                    padding: '0.5rem', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '4px' 
                  }}>
                    <span>
                      {key}: <strong>{value.toFixed(2)} €</strong>
                    </span>
                    <IconButton size="small" color="error" onClick={() => handleRemoveSpecialCost(key)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
              </Paper>
            ) : (
              <Alert severity="info" sx={{ py: 1 }}>
                Nessun costo speciale configurato
              </Alert>
            )}
          </div>
        </div>

        {/* Sezione 3: Configurazione Costi per Tipo Atleta */}
        <h6 className="text-primary text-center register-section-title">Configurazione Costi per tipologia atleta</h6>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 500, color: '#333' }}>Inserisci i costi di iscrizione per ciascuna tipologia di atleta</label>
            <Button
              size='s'
              onClick={() => setAthleteConfigModalOpen(true)}
            >
              Aggiungi
            </Button>
          </div>

          {athleteCostConfigs.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1rem' 
            }}>
              {athleteCostConfigs.map((config, index) => (
                <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
                  <CardContent sx={{ pb: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {getAthleteTypeName(config.idConfigTipoAtleta)}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveAthleteConfig(index)}
                        sx={{ mt: -1, mr: -1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                    
                    <Chip 
                      label={getConfigTypeLabel(config.type)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {getConfigDescription(config)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert severity="info">
              Nessuna configurazione costi atleta. Clicca "Aggiungi Configurazione" per iniziare.
            </Alert>
          )}
          </div>
        </div>

        {/* Pulsante Conferma */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Button type="submit" size="l" variant="primary">
            Salva configurazioni
          </Button>
        </div>
      </form>

      {/* Modale Aggiungi Costo Speciale */}
      <Dialog open={specialCostModalOpen} onClose={() => setSpecialCostModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aggiungi Costo Speciale</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Inserisci un costo fisso che verrà applicato a tutti gli atleti
          </Typography>
          
          <TextField
            label="Nome Costo"
            value={newSpecialName}
            onChange={(e) => setNewSpecialName(e.target.value)}
            fullWidth
            placeholder="es. Assicurazione"
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            label="Importo (€)"
            value={newSpecialCost}
            onChange={(e) => setNewSpecialCost(e.target.value)}
            type="number"
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpecialCostModalOpen(false)}>Annulla</Button>
          <Button 
            onClick={handleAddSpecialCost} 
            variant="contained"
            disabled={!newSpecialName || !newSpecialCost}
          >
            Aggiungi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale Aggiungi Configurazione Atleta */}
      <Dialog open={athleteConfigModalOpen} onClose={() => setAthleteConfigModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Aggiungi Configurazione Tipo Atleta</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Tipo Atleta</FormLabel>
                <RadioGroup
                  value={newAthleteConfig.idConfigTipoAtleta || ''}
                  onChange={(e) => handleNewAthleteConfigChange('idConfigTipoAtleta', e.target.value)}
                >
                  {athleteTypes.map((type) => (
                    <FormControlLabel
                      key={type.id}
                      value={type.id}
                      control={<Radio />}
                      label={type.nome}
                      disabled={athleteCostConfigs.some(config => config.idConfigTipoAtleta === type.id)}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Modalità di Calcolo</FormLabel>
                <RadioGroup
                  value={newAthleteConfig.type}
                  onChange={(e) => handleNewAthleteConfigChange('type', e.target.value)}
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

            {newAthleteConfig.type === 'fixed' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Importo Fisso (€)"
                  type="number"
                  value={newAthleteConfig.config.amount || 0}
                  onChange={(e) => handleNewConfigValueChange('amount', e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}

            {newAthleteConfig.type === 'minimum' && (
              <Grid item xs={12}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <Typography variant="body2" fontWeight={500}>Scaglioni</Typography>
                    <Button
                      size='s'
                      onClick={handleAddScaglione}
                    >
                      Aggiungi
                    </Button>
                  </div>
                  {newAthleteConfig.config.minCategories?.map((minCat, scagIdx) => (
                    <div key={scagIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <TextField
                        label="Da N Categorie"
                        type="number"
                        value={minCat}
                        onChange={(e) => handleNewMinimumConfigChange(scagIdx, 'minCategories', e.target.value)}
                        inputProps={{ min: 1 }}
                        size="small"
                        sx={{ width: '150px' }}
                      />
                      <TextField
                        label="Costo (€)"
                        type="number"
                        value={newAthleteConfig.config.costs[scagIdx] || 0}
                        onChange={(e) => handleNewMinimumConfigChange(scagIdx, 'costs', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                        size="small"
                        sx={{ width: '150px' }}
                      />
                      {scagIdx > 0 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveScaglione(scagIdx)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </div>
              </Grid>
            )}

            {newAthleteConfig.type === 'additional' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Prima Categoria (€)"
                    type="number"
                    value={newAthleteConfig.config.first || 0}
                    onChange={(e) => handleNewConfigValueChange('first', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Ogni Categoria Extra (€)"
                    type="number"
                    value={newAthleteConfig.config.extra || 0}
                    onChange={(e) => handleNewConfigValueChange('extra', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAthleteConfigModalOpen(false)}>Annulla</Button>
          <Button 
            onClick={handleSaveAthleteConfig} 
            variant="contained"
            disabled={newAthleteConfig.idConfigTipoAtleta === null}
          >
            Salva Configurazione
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CostsTab;
