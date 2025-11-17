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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert,
  Box,
  Chip,
  Paper
} from '@mui/material';
import { loadExperiencesByAthleteType, loadCategoryTypeById } from '../api/config';

const CategorySelector = ({
  open,
  onClose,
  onConfirm,
  athlete,
  competition,
  title = "Seleziona Categoria"
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableExperiences, setAvailableExperiences] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState({});

  useEffect(() => {
    const loadCategoryDetails = async () => {
      const availableCategories = getAvailableCategoriesForAthlete();
      const details = {};
      
      for (const category of availableCategories) {
        try {
          const categoryDetail = await loadCategoryTypeById(category.configTipoCategoria);
          details[category.configTipoCategoria] = {...categoryDetail};
        } catch (err) {
          console.error('Errore nel caricamento dettagli categoria:', err);
        }
      }
      
      setCategoryDetails(details);
    };

    if (open && competition?.categorieAtleti && athlete?.tipoAtletaId) {
      loadCategoryDetails();
    }
  }, [open, competition?.categorieAtleti, athlete?.tipoAtletaId]);

  const steps = ['Seleziona la categoria per l\'iscrizione', 'Seleziona il grado di esperienza', 'Inserisci il peso dell\'atleta (Kg)'];

  // Calcola quali step sono necessari
  const getRequiredSteps = () => {
    // Categoria sempre richiesta
    const requiredSteps = [0]; 
    
    // Step esperienza solo se ci sono esperienze disponibili
    if (availableExperiences.length > 0) {
      requiredSteps.push(1);
    }
    
    // Step peso solo se obbligatorio per la categoria selezionata
    if (selectedCategory?.obbligoPeso) {
      requiredSteps.push(2);
    }
    
    return requiredSteps;
  };

  // Reset quando si apre/chiude il dialog
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setSelectedCategory(null);
      setSelectedExperience(null);
      setWeight(athlete?.peso || ''); // Precompila con il peso dell'atleta
      setError(null);
    }
  }, [open, athlete]);

  // Calcola le categorie disponibili per l'atleta
  const getAvailableCategoriesForAthlete = () => {
    if (!competition?.categorieAtleti || !athlete?.tipoAtletaId) {
      return [];
    }

    const athleteConfig = competition.categorieAtleti.find(
      ca => ca.idTipoAtleta === athlete.tipoAtletaId
    );

    if (!athleteConfig) {
      return [];
    }

    return athleteConfig.categorie || [];
  };

  // Calcola la categoria selezionata per atleta 
  const getSelectedCategoryForAthlete = (categoryId) => {
    if (!competition?.categorieAtleti || !athlete?.tipoAtletaId || !categoryId) {
      return null;
    }

    const athleteConfig = competition.categorieAtleti.find(
      ca => ca.idTipoAtleta === athlete.tipoAtletaId
    );

    // Trova la categoria selezionata per l'atleta
    return athleteConfig?.categorie.find(
      cat => cat.configTipoCategoria === categoryId
    ) || null;
  };

  // Carica le esperienze quando viene selezionata una categoria
  useEffect(() => {
    const loadExperiences = async () => {
      if (selectedCategory && athlete?.tipoAtletaId) {
        try {
          setLoading(true);
          const experiences = await loadExperiencesByAthleteType(athlete.tipoAtletaId);

          // Trova la configurazione della categoria nella competizione
          const athleteConfig = competition.categorieAtleti.find(
            ca => ca.idTipoAtleta === athlete.tipoAtletaId
          );
          
          const categoryConfig = athleteConfig?.categorie.find(
            cat => cat.configTipoCategoria === selectedCategory.id
          );

          // Filtra le esperienze in base a quelle configurate per questa categoria
          let filteredExperiences = [];
          if (categoryConfig?.idEsperienza && categoryConfig.idEsperienza.length > 0) {
            filteredExperiences = experiences.filter(exp => 
              categoryConfig.idEsperienza.includes(exp.id)
            );
          }

          setAvailableExperiences(filteredExperiences);
        } catch (err) {
          console.error('Errore nel caricamento delle esperienze:', err);
          setError('Errore nel caricamento delle esperienze');
        } finally {
          setLoading(false);
        }
      }
    };

    loadExperiences();
  }, [selectedCategory, athlete?.tipoAtletaId, competition]);

  const handleCategoryChange = async (event) => {
    const categoryId = event.target.value;
    
    try {
      setLoading(true);
      setError(null);

      let selCategory = categoryDetails[categoryId];
      const categoryCompetition = getSelectedCategoryForAthlete(categoryId);
      selCategory = {...selCategory, ...categoryCompetition};

      setSelectedCategory(selCategory);
      setSelectedExperience(null);
      setActiveStep(0);
    } catch (err) {
      console.error('Errore nel caricamento della categoria:', err);
      setError('Errore nel caricamento della categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceChange = (experienceId) => {
    setSelectedExperience(experienceId);
  };

  const handleNext = () => {
    const requiredSteps = getRequiredSteps();
    const currentIndex = requiredSteps.indexOf(activeStep);
    if (currentIndex < requiredSteps.length - 1) {
      setActiveStep(requiredSteps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const requiredSteps = getRequiredSteps();
    const currentIndex = requiredSteps.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(requiredSteps[currentIndex - 1]);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCategory) {
      setError('Seleziona una categoria');
      return;
    }

    // Verifica se il peso è obbligatorio e non è stato inserito
    if (selectedCategory.obbligoPeso && (!weight || weight.length === 0)) {
      setError('Il peso è obbligatorio per questa categoria');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const registrationData = {
        tipoCategoriaId: selectedCategory.id,
        idConfigEsperienza: selectedExperience ? parseInt(selectedExperience) : null,
        peso: weight && weight.length > 0 ? parseFloat(weight) : null
      };

      await onConfirm(registrationData);
    } catch (err) {
      // Gestione errori specifici
      if (err.response?.status === 409 || err.message?.includes('già iscritto')) {
        setError('L\'atleta è già iscritto a questa categoria');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Dati non validi per l\'iscrizione');
      } else {
        setError('Errore durante l\'iscrizione');
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromStep = (step) => {
    switch (step) {
      case 0: return selectedCategory !== null;
      case 1: return selectedExperience !== null;
      case 2: return selectedCategory?.obbligoPeso ? (weight && weight.length > 0) : true;
      default: return false;
    }
  };

  const isStepRequired = (step) => {
    const requiredSteps = getRequiredSteps();
    return requiredSteps.includes(step);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Select
                value={selectedCategory?.id || ''}
                onChange={handleCategoryChange}
                disabled={loading}
              >
                {getAvailableCategoriesForAthlete().map((category) => {
                  const categoryDetail = categoryDetails[category.configTipoCategoria];
                  return (
                    <MenuItem key={category.configTipoCategoria} value={category.configTipoCategoria}>
                      {categoryDetail?.nome || `Categoria ${category.configTipoCategoria}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {/* Dettagli categoria selezionata: TODO - Modificare lo stile o rimuovere */}
            {selectedCategory && (
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${selectedCategory.nome} - ${selectedCategory.descrizione || ''}`}
                  color="primary"
                  variant="outlined"
                />
                {selectedCategory.obbligoPeso && (
                  <Chip 
                    label="Peso obbligatorio"
                    color="warning"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>            
            {availableExperiences.length === 0 ? (
              <Alert severity="info">
                Nessuna esperienza specifica richiesta per questa categoria
              </Alert>
            ) : (
              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedExperience || ''}
                  onChange={(e) => handleExperienceChange(e.target.value)}
                >
                  {availableExperiences.map((experience) => (
                    <FormControlLabel
                      key={experience.id}
                      value={experience.id}
                      control={<Radio />}
                      label={`${experience.nome} - ${experience.descrizione || ''}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>            
            <TextField
              fullWidth
              type="number"
              value={weight}
              adornment="kg"
              onChange={(e) => setWeight(e.target.value)}
              required={selectedCategory?.obbligoPeso}
              inputProps={{ min: 20, max: 200, step: 0.1 }}
              InputProps={{ endAdornment: <span style={{ marginLeft: 8 }}>Kg</span> }}
              sx={{ mt: 2 }}
            />

            {athlete?.peso && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Peso attuale dell'atleta: {athlete.peso} kg
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Contenuto sconosciuto';
    }
  };

  const availableCategories = getAvailableCategoriesForAthlete();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title} - {athlete?.nome} {athlete?.cognome}
      </DialogTitle>
      <DialogContent>
        {availableCategories.length === 0 ? (
          <Alert severity="warning">
            Nessuna categoria disponibile per il tipo atleta di {athlete?.nome}
          </Alert>
        ) : (
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.filter((_, index) => isStepRequired(index)).map((label, filteredIndex) => {
              const originalIndex = getRequiredSteps()[filteredIndex];
              return (
                <Step key={label}>
                  <StepLabel>
                    {label}
                  </StepLabel>
                  <StepContent>
                    {getStepContent(originalIndex)}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        )}
      </DialogContent>
      {error && (
        <Alert severity="error" sx={{ mx: 1 }}>
          {error}
        </Alert>
      )}
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose}>
          Annulla
        </Button>
        
        <Box>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Indietro
            </Button>
          )}
          
          {(() => {
            const requiredSteps = getRequiredSteps();
            const isLastStep = activeStep === requiredSteps[requiredSteps.length - 1];
            
            return isLastStep ? (
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={!canProceedFromStep(activeStep) || loading}
              >
                {loading ? 'Iscrizione...' : 'Conferma Iscrizione'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceedFromStep(activeStep) || loading}
              >
                Continua
              </Button>
            );
          })()}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CategorySelector;