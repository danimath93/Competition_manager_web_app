import React, { useState, useEffect } from 'react';
import {
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { 
  loadAthleteTypes, 
  loadCompetitionTypes, 
  loadCategoriesByCompetitionType,
  loadExperiencesByAthleteType 
} from '../../api/config';
import HorizontalStepper from '../common/HorizontalStepper';
import Button from '../common/Button';
import '../styles/Layout.css';
import '../styles/Register.css';

const steps = [
  { label: 'Seleziona Tipi Atleta', number: 1 },
  { label: 'Seleziona Tipo Competizione', number: 2 },
  { label: 'Seleziona Categorie per Tipo Atleta', number: 3 },
  { label: 'Assegna Livelli Esperienza', number: 4 }
];

const CategoriesTab = ({ value = { categorieAtleti: [], tipiCompetizione: [] }, onChange, isEditMode = false }) => {
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
  const [selectedExperiences, setSelectedExperiences] = useState({});
  
  // Dialog di conferma per reset
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
    const athleteTypeIds = value.categorieAtleti.map(ca => ca.idTipoAtleta);
    setSelectedAthleteTypes(athleteTypeIds);
    
    if (value.tipiCompetizione && value.tipiCompetizione.length > 0) {
      const selectedCompTypes = competitionTypes.filter(ct => 
        value.tipiCompetizione.includes(ct.id)
      );
      setSelectedCompetitionTypes(selectedCompTypes);
      loadCategoriesForCompetitionTypes(selectedCompTypes);
    }
    
    const categoriesMap = {};
    value.categorieAtleti.forEach(ca => {
      categoriesMap[ca.idTipoAtleta] = ca.categorie.map(cat => cat.configTipoCategoria);
    });
    setSelectedCategories(categoriesMap);
    
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
    setActiveStep(3);
  };

  const loadCategoriesForCompetitionTypes = async (competitionTypes) => {
    try {
      const allCategories = [];
      for (const compType of competitionTypes) {
        const categories = await loadCategoriesByCompetitionType(compType.id);
        allCategories.push(...categories);
      }
      
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
      const newCategories = { ...selectedCategories };
      delete newCategories[athleteTypeId];
      setSelectedCategories(newCategories);
      
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
      
      if (newSelectedTypes.length > 0) {
        await loadCategoriesForCompetitionTypes(newSelectedTypes);
      } else {
        setCategoryTypes([]);
      }
      
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

  const getFilteredExperiencesForCompetitionType = (athleteTypeId, competitionTypeId) => {
    const athleteExperiences = experiences[athleteTypeId] || [];
    
    return athleteExperiences.filter(experience => {
      if (!experience.tipiCompetizione || experience.tipiCompetizione.length === 0) {
        return true;
      }
      return experience.tipiCompetizione.includes(competitionTypeId);
    });
  };
  
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
    if (activeStep === 3) {
      handleFinish();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
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
    onChange({ categorieAtleti: [], tipiCompetizione: [] });
  };

  const handleFinish = () => {
    const categorieAtleti = selectedAthleteTypes.map(athleteTypeId => {
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
    onChange({ categorieAtleti, tipiCompetizione });
  };

  const canProceedFromStep = (step) => {
    switch (step) {
      case 0: return selectedAthleteTypes.length > 0;
      case 1: return selectedCompetitionTypes.length > 0;
      case 2: return Object.keys(selectedCategories).length > 0 && 
                     selectedAthleteTypes.every(athleteId => 
                       selectedCategories[athleteId]?.length > 0
                     );
      case 3: return true;
      default: return false;
    }
  };

  const getAvailableCategoriesForAthleteType = (athleteTypeId) => {
    return categoryTypes.filter(category => 
      category.idConfigTipiAtleti?.includes(athleteTypeId) || 
      !category.idConfigTipiAtleti
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
              <FormControl component="fieldset" variant="standard" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500, fontSize: '1rem' }}>
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
                          disabled={loading}
                        />
                      }
                      label={`${athleteType.nome} - ${athleteType.descrizione || ''}`}
                    />
                  ))}
                </FormGroup>
                {selectedAthleteTypes.length === 0 && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    Seleziona almeno un tipo di atleta
                  </FormHelperText>
                )}
                {selectedAthleteTypes.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    {selectedAthleteTypes.map(id => {
                      const athleteType = athleteTypes.find(at => at.id === id);
                      return athleteType ? (
                        <Chip key={id} label={athleteType.nome} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ) : null;
                    })}
                  </div>
                )}
              </FormControl>
            </div>
          </div>
        );

      case 1:
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
              <FormControl component="fieldset" variant="standard" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500, fontSize: '1rem' }}>
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
                          disabled={loading}
                        />
                      }
                      label={`${competitionType.nome} - ${competitionType.descrizione || ''}`}
                    />
                  ))}
                </FormGroup>
                {selectedCompetitionTypes.length === 0 && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    Seleziona almeno un tipo di competizione
                  </FormHelperText>
                )}
                {selectedCompetitionTypes.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    {selectedCompetitionTypes.map(ct => (
                      <Chip key={ct.id} label={ct.nome} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </div>
                )}
              </FormControl>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500, fontSize: '1rem' }}>
                Seleziona le categorie disponibili per ogni tipo di atleta
              </FormLabel>
              
              {selectedAthleteTypes.map(athleteTypeId => {
                const athleteType = athleteTypes.find(at => at.id === athleteTypeId);
                const availableCategories = getAvailableCategoriesForAthleteType(athleteTypeId);
                
                return (
                  <Accordion key={athleteTypeId} defaultExpanded sx={{ mb: 1 }}>
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
                                disabled={loading}
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
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem' }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500, fontSize: '1rem' }}>
                Assegna i livelli di esperienza per ogni tipo atleta e tipo competizione (opzionale)
              </FormLabel>
              
              {selectedAthleteTypes.map(athleteTypeId => {
                const athleteType = athleteTypes.find(at => at.id === athleteTypeId);
                
                return (
                  <Accordion key={athleteTypeId} defaultExpanded sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">
                        {athleteType?.nome}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {selectedCompetitionTypes.map(competitionType => {
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
                                if (!experiences[athleteTypeId]) {
                                  loadExperiencesForAthleteType(athleteTypeId);
                                  return (
                                    <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                      Caricamento esperienze...
                                    </Typography>
                                  );
                                }
                                
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
                                        disabled={loading}
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
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasError = !value.categorieAtleti || value.categorieAtleti.length === 0;

  return (
    <>
      <div className="register-form" style={{ maxWidth: '1024px' }}>
        <h6 className="text-primary text-center register-section-title">Configura le tipologie, gli atleti e le categorie di questa competizione</h6>

        {hasError && !isEditMode && (
          <Alert severity="warning" sx={{ maxWidth: '1024px', margin: '0 auto 2rem', mx: 2 }}>
            Configura almeno una categoria per gli atleti
          </Alert>
        )}

        {/* Horizontal Stepper */}
        <div style={{ marginBottom: '2rem' }}>
          <HorizontalStepper
            steps={steps}
            activeStep={activeStep}
          />
        </div>

        {/* Step Content */}
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="outline-secondary"
                size="m"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="outline-primary"
                size="m"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Indietro
              </Button>
            </div>
            
            <Button
              variant="primary"
              size="m"
              onClick={handleNext}
              disabled={!canProceedFromStep(activeStep) || loading}
            >
              {activeStep === 3 ? 'Conferma' : 'Continua'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog di conferma reset */}
      <Dialog 
        open={showResetDialog} 
        onClose={() => setShowResetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
            Conferma Reset
          </div>
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
          <Button onClick={performReset} variant="contained-warning">
            Conferma Reset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoriesTab;
