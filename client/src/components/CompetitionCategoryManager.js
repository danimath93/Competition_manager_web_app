import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Alert,
  Chip,
  FormControl,
  FormLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { 
  loadAthleteTypes, 
  loadCompetitionTypes, 
  loadCategoriesByCompetitionType,
  loadExperiencesByAthleteType 
} from '../api/config';

const steps = [
  'Seleziona Tipi Atleta',
  'Seleziona Tipo Competizione', 
  'Seleziona Categorie per Tipo Atleta',
  'Assegna Livelli Esperienza'
];

const CompetitionCategoryManager = ({ 
  value = { categorieAtleti: [], tipiCompetizione: [] }, 
  onChange, 
  error, 
  helperText, 
  disabled = false,
  isEditMode = false 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Dati di configurazione
  const [athleteTypes, setAthleteTypes] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [experiences, setExperiences] = useState({});
  
  // Stato della selezione
  const [selectedAthleteTypes, setSelectedAthleteTypes] = useState([]);
  const [selectedCompetitionTypes, setSelectedCompetitionTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedExperiences, setSelectedExperiences] = useState({}); // key: athleteTypeId_competitionTypeId
  
  // Dialog di conferma per edit mode
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Carica i dati iniziali
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [athleteTypesData, competitionTypesData] = await Promise.all([
          loadAthleteTypes(),
          loadCompetitionTypes()
        ]);
        setAthleteTypes(athleteTypesData);
        setCompetitionTypes(competitionTypesData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati iniziali:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Inizializza i dati se siamo in edit mode
  useEffect(() => {
    if (isEditMode && value?.categorieAtleti?.length > 0) {
      initializeFromExistingData();
    }
  }, [value, isEditMode, athleteTypes, competitionTypes]);

  const initializeFromExistingData = () => {
    // Estrai i tipi atleta selezionati
    const athleteTypeIds = value.categorieAtleti.map(ca => ca.idTipoAtleta);
    setSelectedAthleteTypes(athleteTypeIds);
    
    // Recupera i tipi di competizione se disponibili
    if (value.tipiCompetizione && value.tipiCompetizione.length > 0) {
      const selectedCompTypes = competitionTypes.filter(ct => 
        value.tipiCompetizione.includes(ct.id)
      );
      setSelectedCompetitionTypes(selectedCompTypes);
      
      // Carica le categorie per i tipi di competizione selezionati
      loadCategoriesForCompetitionTypes(selectedCompTypes);
    }
    
    // Estrai le categorie selezionate
    const categoriesMap = {};
    value.categorieAtleti.forEach(ca => {
      categoriesMap[ca.idTipoAtleta] = ca.categorie.map(cat => cat.configTipoCategoria);
    });
    setSelectedCategories(categoriesMap);
    
    // Estrai le esperienze dalla struttura esperienzaCategorie dentro categorieAtleti
    const experiencesMap = {};
    value.categorieAtleti.forEach(ca => {
      if (ca.esperienzaCategorie) {
        ca.esperienzaCategorie.forEach(ec => {
          const key = `${ca.idTipoAtleta}_${ec.configTipoCompetizione}`;
          experiencesMap[key] = ec.idEsperienza || [];
        });
      }
    });
    setSelectedExperiences(experiencesMap);
    setActiveStep(3); // Vai all'ultimo step
  };

  const loadCategoriesForCompetitionTypes = async (competitionTypes) => {
    try {
      const allCategories = [];
      for (const compType of competitionTypes) {
        const categories = await loadCategoriesByCompetitionType(compType.id);
        allCategories.push(...categories);
      }
      
      // Rimuovi duplicati basandosi sull'ID
      const uniqueCategories = allCategories.filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      );
      
      setCategoryTypes(uniqueCategories);
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    }
  };

  const handleAthleteTypeChange = (athleteTypeId, checked) => {
    let newSelected;
    if (checked) {
      newSelected = [...selectedAthleteTypes, athleteTypeId];
    } else {
      newSelected = selectedAthleteTypes.filter(id => id !== athleteTypeId);
      // Rimuovi anche le categorie e esperienze associate
      const newCategories = { ...selectedCategories };
      delete newCategories[athleteTypeId];
      setSelectedCategories(newCategories);
      
      // Rimuovi le esperienze per questo tipo atleta
      const newExperiences = { ...selectedExperiences };
      Object.keys(newExperiences).forEach(key => {
        if (key.startsWith(`${athleteTypeId}_`)) {
          delete newExperiences[key];
        }
      });
      setSelectedExperiences(newExperiences);
    }
    setSelectedAthleteTypes(newSelected);
  };

  const handleCompetitionTypeChange = async (competitionType, checked) => {
    try {
      setLoading(true);
      let newSelectedTypes;
      
      if (checked) {
        newSelectedTypes = [...selectedCompetitionTypes, competitionType];
      } else {
        newSelectedTypes = selectedCompetitionTypes.filter(ct => ct.id !== competitionType.id);
      }
      
      setSelectedCompetitionTypes(newSelectedTypes);
      
      // Carica le categorie per tutti i tipi di competizione selezionati
      if (newSelectedTypes.length > 0) {
        await loadCategoriesForCompetitionTypes(newSelectedTypes);
      } else {
        setCategoryTypes([]);
      }
      
      // Reset selezioni successive quando cambiano i tipi di competizione
      setSelectedCategories({});
      setSelectedExperiences({});
      
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (athleteTypeId, categoryId, checked) => {
    const newCategories = { ...selectedCategories };
    if (!newCategories[athleteTypeId]) {
      newCategories[athleteTypeId] = [];
    }
    
    if (checked) {
      newCategories[athleteTypeId] = [...newCategories[athleteTypeId], categoryId];
    } else {
      newCategories[athleteTypeId] = newCategories[athleteTypeId].filter(id => id !== categoryId);
    }
    
    setSelectedCategories(newCategories);
  };

  const handleExperienceChange = (athleteTypeId, competitionTypeId, experienceId, checked) => {
    const key = `${athleteTypeId}_${competitionTypeId}`;
    const newExperiences = { ...selectedExperiences };
    
    if (!newExperiences[key]) {
      newExperiences[key] = [];
    }
    
    if (checked) {
      newExperiences[key] = [...newExperiences[key], experienceId];
    } else {
      newExperiences[key] = newExperiences[key].filter(id => id !== experienceId);
    }
    
    setSelectedExperiences(newExperiences);
  };

  // Filtra le esperienze in base al tipo di competizione
  const getFilteredExperiencesForCompetitionType = (athleteTypeId, competitionTypeId) => {
    const athleteExperiences = experiences[athleteTypeId] || [];
    
    // Filtra le esperienze che supportano questo tipo di competizione
    return athleteExperiences.filter(experience => {
      // Se tipiCompetizione è null o vuoto, l'esperienza è valida per tutti i tipi
      if (!experience.tipiCompetizione || experience.tipiCompetizione.length === 0) {
        return true;
      }
      
      // Verifica se il tipo di competizione è tra quelli supportati dall'esperienza
      return experience.tipiCompetizione.includes(competitionTypeId);
    });
  };
  
  // Verifica se un tipo atleta ha almeno una categoria per un dato tipo competizione
  const hasAthleteTypeInCompetitionType = (athleteTypeId, competitionTypeId) => {
    const selectedCategoriesForType = selectedCategories[athleteTypeId] || [];
    return selectedCategoriesForType.some(categoryId => {
      const category = categoryTypes.find(ct => ct.id === categoryId);
      return category && category.tipoCompetizioneId === competitionTypeId;
    });
  };

  const loadExperiencesForAthleteType = async (athleteTypeId) => {
    if (experiences[athleteTypeId]) return;
    
    try {
      const athleteExperiences = await loadExperiencesByAthleteType(athleteTypeId);
      setExperiences(prev => ({
        ...prev,
        [athleteTypeId]: athleteExperiences
      }));
    } catch (error) {
      console.error('Errore nel caricamento delle esperienze:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    if (isEditMode && (selectedAthleteTypes.length > 0 || Object.keys(selectedCategories).length > 0)) {
      setShowResetDialog(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    setActiveStep(0);
    setSelectedAthleteTypes([]);
    setSelectedCompetitionTypes([]);
    setSelectedCategories({});
    setSelectedExperiences({});
    setCategoryTypes([]);
    setExperiences({});
    setShowResetDialog(false);
    
    // Notifica il parent del reset
    onChange({ categorieAtleti: [], tipiCompetizione: [] });
  };

  const handleFinish = () => {
    // Costruisci la struttura finale per categorieAtleti con esperienzaCategorie incluso
    const categorieAtleti = selectedAthleteTypes.map(athleteTypeId => {
      // Crea l'array di esperienzaCategorie per questo tipo atleta
      const esperienzaCategorie = [];
      Object.entries(selectedExperiences).forEach(([key, experienceIds]) => {
        const [expAthleteTypeId, competitionTypeId] = key.split('_').map(Number);
        if (expAthleteTypeId === athleteTypeId && experienceIds && experienceIds.length > 0) {
          esperienzaCategorie.push({
            configTipoCompetizione: competitionTypeId,
            idEsperienza: experienceIds
          });
        }
      });
      
      return {
        idTipoAtleta: athleteTypeId,
        categorie: (selectedCategories[athleteTypeId] || []).map(categoryId => ({
          configTipoCategoria: categoryId
        })),
        esperienzaCategorie
      };
    });

    const tipiCompetizione = selectedCompetitionTypes.map(ct => ct.id);

    // Passa i dati al parent
    onChange({ categorieAtleti, tipiCompetizione });
    
    // Avanza allo step finale per mostrare il messaggio di completamento
    setActiveStep(steps.length);
  };

  // Validazioni per ogni step
  const canProceedFromStep = (step) => {
    switch (step) {
      case 0: return selectedAthleteTypes.length > 0;
      case 1: return selectedCompetitionTypes.length > 0;
      case 2: return Object.keys(selectedCategories).length > 0 && 
                     selectedAthleteTypes.every(athleteId => 
                       selectedCategories[athleteId]?.length > 0
                     );
      case 3: return true; // Le esperienze sono opzionali
      default: return false;
    }
  };

  const isStepComplete = (step) => {
    return step < activeStep || (step === activeStep && canProceedFromStep(step));
  };

  // Filtra le categorie disponibili per un tipo atleta
  const getAvailableCategoriesForAthleteType = (athleteTypeId) => {
    return categoryTypes.filter(category => 
      category.idConfigTipiAtleti?.includes(athleteTypeId) || 
      !category.idConfigTipiAtleti
    );
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ alignItems: 'center', mb: 2 }}>
          <Typography variant="h8" component="h3">
            Configurazione Categorie e Atleti
          </Typography>
          {isEditMode && (
            <Button 
              variant="outlined" 
              color="warning"
              sx={{ my: 1 }}
              onClick={handleReset}
              startIcon={<WarningAmberIcon />}
              size="small"
            >
              Reset Configurazione
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {helperText}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Selezione Tipi Atleta */}
          <Step>
            <StepLabel>
              {steps[0]}
              {selectedAthleteTypes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {selectedAthleteTypes.map(id => {
                    const athleteType = athleteTypes.find(at => at.id === id);
                    return athleteType ? (
                      <Chip key={id} label={athleteType.nome} size="small" sx={{ mr: 0.5 }} />
                    ) : null;
                  })}
                </Box>
              )}
            </StepLabel>
            <StepContent>
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend">
                  Seleziona i tipi di atleta per cui organizzi la gara
                </FormLabel>
                <FormGroup>
                  {athleteTypes.map(athleteType => (
                    <FormControlLabel
                      key={athleteType.id}
                      control={
                        <Checkbox
                          checked={selectedAthleteTypes.includes(athleteType.id)}
                          onChange={(e) => handleAthleteTypeChange(athleteType.id, e.target.checked)}
                          disabled={disabled || loading}
                        />
                      }
                      label={`${athleteType.nome} - ${athleteType.descrizione || ''}`}
                    />
                  ))}
                </FormGroup>
                {selectedAthleteTypes.length === 0 && (
                  <FormHelperText error>
                    Seleziona almeno un tipo di atleta
                  </FormHelperText>
                )}
              </FormControl>
              <Box sx={{ mb: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceedFromStep(0)}
                >
                  Continua
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Selezione Tipo Competizione */}
          <Step>
            <StepLabel>
              {steps[1]}
              {selectedCompetitionTypes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {selectedCompetitionTypes.map(ct => (
                    <Chip key={ct.id} label={ct.nome} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
              )}
            </StepLabel>
            <StepContent>
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend">
                  Seleziona i tipi di competizione (selezione multipla)
                </FormLabel>
                <FormGroup>
                  {competitionTypes.map(competitionType => (
                    <FormControlLabel
                      key={competitionType.id}
                      control={
                        <Checkbox
                          checked={selectedCompetitionTypes.some(ct => ct.id === competitionType.id)}
                          onChange={(e) => handleCompetitionTypeChange(competitionType, e.target.checked)}
                          disabled={disabled || loading}
                        />
                      }
                      label={`${competitionType.nome} - ${competitionType.descrizione || ''}`}
                    />
                  ))}
                </FormGroup>
                {selectedCompetitionTypes.length === 0 && (
                  <FormHelperText error>
                    Seleziona almeno un tipo di competizione
                  </FormHelperText>
                )}
              </FormControl>
              <Box sx={{ mb: 1, mt: 2 }}>
                <Button
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Indietro
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceedFromStep(1) || loading}
                >
                  Continua
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Selezione Categorie per Tipo Atleta */}
          <Step>
            <StepLabel>
              {steps[2]}
              {Object.keys(selectedCategories).length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {Object.entries(selectedCategories).map(([athleteTypeId, categoryIds]) => {
                    const athleteType = athleteTypes.find(at => at.id === parseInt(athleteTypeId));
                    return athleteType && categoryIds.length > 0 ? (
                      <Chip 
                        key={athleteTypeId} 
                        label={`${athleteType.nome}: ${categoryIds.length} categorie`} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ) : null;
                  })}
                </Box>
              )}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Seleziona le categorie disponibili per ogni tipo di atleta
              </Typography>
              
              {selectedAthleteTypes.map(athleteTypeId => {
                const athleteType = athleteTypes.find(at => at.id === athleteTypeId);
                const availableCategories = getAvailableCategoriesForAthleteType(athleteTypeId);
                
                return (
                  <Accordion key={athleteTypeId} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">
                        {athleteType?.nome}
                        {selectedCategories[athleteTypeId]?.length > 0 && (
                          <Chip 
                            label={`${selectedCategories[athleteTypeId].length} selezionate`}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormGroup>
                        {availableCategories.map(category => (
                          <FormControlLabel
                            key={category.id}
                            control={
                              <Checkbox
                                checked={selectedCategories[athleteTypeId]?.includes(category.id) || false}
                                onChange={(e) => handleCategoryChange(athleteTypeId, category.id, e.target.checked)}
                                disabled={disabled || loading}
                              />
                            }
                            label={`${category.nome} - ${category.descrizione || ''}`}
                          />
                        ))}
                      </FormGroup>
                      {availableCategories.length === 0 && (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          Nessuna categoria disponibile per questo tipo di atleta
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
              
              <Box sx={{ mb: 1, mt: 2 }}>
                <Button
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Indietro
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceedFromStep(2)}
                >
                  Continua
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Assegnazione Livelli Esperienza */}
          <Step>
            <StepLabel>
              {steps[3]}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Assegna i livelli di esperienza per ogni tipo atleta e tipo competizione (opzionale)
              </Typography>
              
              {selectedAthleteTypes.map(athleteTypeId => {
                const athleteType = athleteTypes.find(at => at.id === athleteTypeId);
                
                return (
                  <Accordion key={athleteTypeId} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">
                        {athleteType?.nome}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {selectedCompetitionTypes.map(competitionType => {
                        // Verifica se questo tipo atleta ha almeno una categoria in questo tipo competizione
                        if (!hasAthleteTypeInCompetitionType(athleteTypeId, competitionType.id)) {
                          return null;
                        }
                        
                        const experienceKey = `${athleteTypeId}_${competitionType.id}`;
                        
                        return (
                          <Paper key={competitionType.id} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              {competitionType.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              Seleziona i livelli di esperienza per tutte le categorie di questo tipo competizione
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <FormGroup row>
                              {(() => {
                                // Carica le esperienze se non sono già state caricate
                                if (!experiences[athleteTypeId]) {
                                  loadExperiencesForAthleteType(athleteTypeId);
                                  return (
                                    <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                      Caricamento esperienze...
                                    </Typography>
                                  );
                                }
                                
                                // Ottieni le esperienze filtrate per questo tipo competizione
                                const filteredExperiences = getFilteredExperiencesForCompetitionType(athleteTypeId, competitionType.id);
                                
                                if (filteredExperiences.length === 0) {
                                  return (
                                    <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                      Nessuna esperienza disponibile per questo tipo di competizione
                                    </Typography>
                                  );
                                }
                                
                                return filteredExperiences.map(experience => (
                                  <FormControlLabel
                                    key={experience.id}
                                    control={
                                      <Checkbox
                                        checked={selectedExperiences[experienceKey]?.includes(experience.id) || false}
                                        onChange={(e) => handleExperienceChange(athleteTypeId, competitionType.id, experience.id, e.target.checked)}
                                        disabled={disabled || loading}
                                      />
                                    }
                                    label={experience.nome}
                                  />
                                ));
                              })()}
                            </FormGroup>
                          </Paper>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
              
              <Box sx={{ mb: 1, mt: 2 }}>
                <Button
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Indietro
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFinish}
                  color="success"
                >
                  Completa Configurazione
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>Configurazione completata!</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Riconfigura
            </Button>
          </Paper>
        )}

        {/* Dialog di conferma reset */}
        <Dialog 
          open={showResetDialog} 
          onClose={() => setShowResetDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
              Conferma Reset
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Sei sicuro di voler resettare l'intera configurazione? 
              Tutte le selezioni effettuate verranno perse.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResetDialog(false)}>
              Annulla
            </Button>
            <Button onClick={performReset} color="warning" variant="contained">
              Conferma Reset
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CompetitionCategoryManager;