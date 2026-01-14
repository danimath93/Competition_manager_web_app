import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Autocomplete,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { loadCategoryTypeById, loadExperienceById } from '../api/config';
import { editAthleteRegistrations } from '../api/registrations';
import DrawerModal from './common/DrawerModal';
import ConfirmActionModal from './common/ConfirmActionModal';
import { CompetitionTipology } from '../constants/enums/CompetitionEnums';
import { checkCategoryConstraints } from '../utils/helperRegistration';
import './common/DrawerModal.css';

const RegistrationModal = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  athlete,
  registrations,
  competition,
}) => {
  // Stati per le categorie
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState({});
  const [categoryDetailSelections, setCategoryDetailSelections] = useState({});
  const [weight, setWeight] = useState('');
  const [selectedExperiences, setSelectedExperiences] = useState({});
  
  // Stati per le esperienze - ora organizzate per tipo competizione
  const [availableExperiencesByType, setAvailableExperiencesByType] = useState({});
  
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carica le categorie disponibili e i dati delle iscrizioni esistenti
  useEffect(() => {
    const loadData = async () => {
      if (!open || !competition || !athlete) return;

      try {
        setLoading(true);
        
        // Carica le categorie disponibili dalla competizione
        const categories = [];
        if (competition?.categorieAtleti) {
          competition.categorieAtleti.forEach(categorieTipoAtleta => {
            if (categorieTipoAtleta.idTipoAtleta === athlete.tipoAtletaId && 
                categorieTipoAtleta.categorie && 
                Array.isArray(categorieTipoAtleta.categorie)) {
              categories.push(...categorieTipoAtleta.categorie);
            }
          });
        }
        setAvailableCategories(categories);

        // Carica i dettagli delle categorie
        const details = {};
        for (const category of categories) {
          try {
            const categoryDetail = await loadCategoryTypeById(category.configTipoCategoria);
            details[category.configTipoCategoria] = categoryDetail;
          } catch (error) {
            console.error(`Errore nel caricamento categoria ${category.configTipoCategoria}:`, error);
          }
        }
        setCategoryDetails(details);

        // Carica le esperienze disponibili dalla configurazione della competizione
        const athleteConfig = competition.categorieAtleti?.find(
          ca => ca.idTipoAtleta === athlete.tipoAtletaId
        );

        if (athleteConfig?.esperienzaCategorie) {
          const experiencesByType = {};
          
          // Per ogni tipo competizione, carica le esperienze
          for (const expConfig of athleteConfig.esperienzaCategorie) {
            const tipoCompId = expConfig.configTipoCompetizione;
            const experienceIds = expConfig.idEsperienza || [];
            
            // Carica i dettagli di ogni esperienza
            const experiences = [];
            for (const expId of experienceIds) {
              try {
                const experience = await loadExperienceById(expId);
                experiences.push(experience);
              } catch (error) {
                console.error(`Errore nel caricamento esperienza ${expId}:`, error);
              }
            }
            
            experiencesByType[tipoCompId] = experiences;
          }
          
          setAvailableExperiencesByType(experiencesByType);
        }

        // Imposta le categorie selezionate dalle iscrizioni esistenti
        if (registrations && registrations.length > 0) {
          const selectedCatIds = registrations.map(reg => reg.tipoCategoria?.id || reg.tipoCategoriaId).filter(Boolean);
          setSelectedCategories(selectedCatIds);

          // Imposta i dettagli delle categorie selezionate
          const detailSelections = {};
          registrations.forEach(reg => {
            const catId = reg.tipoCategoria?.id || reg.tipoCategoriaId;
            if (reg.dettagli && catId) {
              detailSelections[catId] = reg.dettagli;
            }
          });
          setCategoryDetailSelections(detailSelections);

          // Imposta il peso se presente (prende il primo che trova)
          const registrationWithWeight = registrations.find(reg => reg.peso);
          if (registrationWithWeight) {
            setWeight(registrationWithWeight.peso.toString());
          }

          // Imposta le esperienze selezionate (raggruppa per tipoCompetizioneId)
          const experiences = {};
          registrations.forEach(reg => {
            const catId = reg.tipoCategoria?.id || reg.tipoCategoriaId;
            if (reg.esperienza && catId) {
              const catDetail = details[catId];
              if (catDetail?.tipoCompetizioneId && !experiences[catDetail.tipoCompetizioneId]) {
                // Salva solo la prima esperienza per tipo competizione (saranno tutte uguali)
                experiences[catDetail.tipoCompetizioneId] = reg.esperienza;
              }
            }
          });
          setSelectedExperiences(experiences);
        }

      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError('Errore nel caricamento dei dati dell\'iscrizione');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, competition, athlete, registrations]);

  // Gestisce la selezione/deselezione di una categoria
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Gestisce la selezione dei dettagli di una categoria
  const handleCategoryDetailChange = (categoryId, newValue) => {
    setCategoryDetailSelections(prev => ({
      ...prev,
      [categoryId]: newValue
    }));
  };

  // Gestisce il cambiamento del peso
  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };

  // Gestisce la selezione dell'esperienza per un tipo competizione
  const handleExperienceChange = (tipoCompetizioneId, newValue) => {
    setSelectedExperiences(prev => ({
      ...prev,
      [tipoCompetizioneId]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Effettua la validazione
      if (competition?.maxCategorieAtleta && selectedCategories.length > competition.maxCategorieAtleta) {
        setError(`Puoi selezionare al massimo ${competition.maxCategorieAtleta} categorie per questa competizione.`);
        return;
      }

      if (selectedCategories.length === 0) {
        setError('Seleziona almeno una categoria per l\'iscrizione.');
        return;
      }

      if (selectedRequiresWeight && (!weight || weight.trim() === '')) {
        setError('Inserisci il peso per le categorie di combattimento selezionate.');
        return;
      }

      for (const categoryId of selectedCategories) {
        const options = getCategoryDetailOptions(categoryId);
        if (options.length > 0 && !categoryDetailSelections[categoryId]) {
          setError('Seleziona i dettagli per tutte le categorie selezionate.');
          return;
        }

        const details = categoryDetails[categoryId];
        if (details?.tipoCompetizioneId) {
          const tipoCompId = details.tipoCompetizioneId;
          if (!selectedExperiences[tipoCompId]) {
            setError('Seleziona il livello di esperienza per tutte le categorie selezionate.');
            return;
          }
        }
      }

      // Prepara i dati da inviare
      const data = {
        // tesseramento,
        categories: selectedCategories,
        categoriesDetails: categoryDetailSelections,
        experiences: selectedExperiences,
        weight: weight || null,
      };
      
      // Chiama on submit per refreshare i dati
      await editAthleteRegistrations(athlete.id, competition.id, data);

      await onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Errore nel salvataggio dell'iscrizione");
    }
  };

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete();
        onClose();
      }
    } catch (error) {
      setError(error.message || "Errore nell'eliminazione dell'iscrizione");
    }
  };

  // Opzioni dettagli categoria per categoryId specifici
  // TODO: Questi valori saranno successivamente caricati dal database tramite configurazione
  const CategoryDetailOptions = {
    // Esempio: categoryId 1 - Quyen Song Luyen
    1: [
      { id: 1, nome: 'TAN SO MOT', value: 'TAN SO MOT' },
      { id: 2, nome: 'THIEN MON', value: 'THIEN MON' },
      { id: 3, nome: 'HUYN LONG THUA VAN ', value: 'HUYN LONG THUA VAN ' },
      { id: 4, nome: 'LOA THANH', value: 'LOA THANH' },
      { id: 5, nome: 'VAN SON', value: 'VAN SON' },
      { id: 6, nome: 'PHUONG HOANG', value: 'PHUONG HOANG' },
      { id: 7, nome: 'THAP TU', value: 'THAP TU' },
      { id: 8, nome: 'LONG HO', value: 'LONG HO' },
      { id: 9, nome: 'LAO HO THUONG SON', value: 'LAO HO THUONG SON' },
      { id: 10, nome: 'BACH HO', value: 'BACH HO' },
      { id: 11, nome: 'LAO MAI', value: 'LAO MAI' },
      { id: 12, nome: 'NGOC TRAN', value: 'NGOC TRAN' }
    ],
    // Aggiungi altre categorie qui man mano che vengono definite
    // categoryId: [ { id, nome, value }, ... ]
  };

  // Opzioni vuote per dettagli - da implementare con enum
  const getCategoryDetailOptions = (categoryId) => {
    return CategoryDetailOptions[categoryId] || [];
  };

  // Verifica se è una categoria di combattimento
  const isFightCategory = (categoryId) => {
    const details = categoryDetails[categoryId];
    return details?.tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO;
  };

  // Verifica se esiste almeno una categoria con obbligo peso
  const hasWeightRequirement = availableCategories.some(category => {
    const details = categoryDetails[category.configTipoCategoria];
    return isFightCategory(category.configTipoCategoria) && details?.obbligoPeso;
  });

  // Verifica se almeno una categoria selezionata richiede il peso
  const selectedRequiresWeight = selectedCategories.some(categoryId => {
    const details = categoryDetails[categoryId];
    return isFightCategory(categoryId) && details?.obbligoPeso;
  });

  // Raggruppa le categorie per tipo competizione
  const categoriesByType = {
    1: [], // Quyen
    2: [], // Quyen Vu Khi
    3: []  // Combattimento
  };

  availableCategories.forEach(category => {
    const details = categoryDetails[category.configTipoCategoria];
    if (details?.tipoCompetizioneId && categoriesByType[details.tipoCompetizioneId]) {
      // Verifica i vincoli prima di aggiungere la categoria
      if (checkCategoryConstraints(category, details.tipoCompetizioneId, athlete, selectedExperiences)) {
        categoriesByType[details.tipoCompetizioneId].push(category);
      }
    }
  });

  // Ottiene le esperienze per i tipi Quyen (1 e 2)
  const quyenExperiences = availableExperiencesByType[1] || availableExperiencesByType[2] || [];
  const canMergeQuyenTypes = categoriesByType[1].length > 0 && categoriesByType[2].length > 0;

  // Verifica se ci sono categorie selezionate per ogni tipo competizione
  const hasSelectedQuyenCategories = selectedCategories.some(catId => {
    const details = categoryDetails[catId];
    return details?.tipoCompetizioneId === 1 || details?.tipoCompetizioneId === 2;
  });
  const hasSelectedFightCategories = selectedCategories.some(catId => {
    const details = categoryDetails[catId];
    return details?.tipoCompetizioneId === 3;
  });

  const renderContent = () => {
    if (loading) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento...</div>;
    }

    if (availableCategories.length === 0) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Nessuna categoria disponibile per questo atleta.
        </div>
      );
    }

    return (
      <>
        {/* Autocomplete Esperienza condiviso per Quyen e Quyen Vu Khi */}
        {canMergeQuyenTypes && quyenExperiences.length > 0 && (
          <div className="drawer-section">
            <h3 className="drawer-section-title">Livello Esperienza Quyen</h3>
            <div className="drawer-section-content">
              <Autocomplete
                size="small"
                value={selectedExperiences[1] || null}
                onChange={(event, newValue) => {
                  handleExperienceChange(1, newValue);
                  handleExperienceChange(2, newValue);
                }}
                options={quyenExperiences}
                getOptionLabel={(option) => option.nome || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Livello Esperienza Quyen / Quyen Vu Khi"
                    variant="outlined"
                    required={hasSelectedQuyenCategories}
                    size="small"
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Sezione Categorie Quyen */}
        {categoriesByType[1].length > 0 && (
          <div className="drawer-section">
            <h3 className="drawer-section-title">Categorie Quyen</h3>
            <div className="drawer-section-content">
              {/* Esperienza separata se non merged */}
              {!canMergeQuyenTypes && quyenExperiences.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <Autocomplete
                    size="small"
                    value={selectedExperiences[1] || null}
                    onChange={(event, newValue) => handleExperienceChange(1, newValue)}
                    options={quyenExperiences}
                    getOptionLabel={(option) => option.nome || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Livello Esperienza"
                        variant="outlined"
                        required={hasSelectedQuyenCategories}
                        size="small"
                      />
                    )}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoriesByType[1].map(category => {
                  const categoryId = category.configTipoCategoria;
                  const details = categoryDetails[categoryId];
                  const isSelected = selectedCategories.includes(categoryId);
                  const detailOptions = getCategoryDetailOptions(categoryId);

                  return (
                    <div
                      key={categoryId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '12px',
                        backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(categoryId)}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                      <div style={{ flex: 1, fontWeight: '500' }}>
                        {details?.nome || 'Categoria'}
                        {category.costo && (
                          <Chip
                            label={`€ ${parseFloat(category.costo).toFixed(2)}`}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: '20px' }}
                          />
                        )}
                      </div>
                      {detailOptions.length > 0 && (
                        <div style={{ minWidth: '200px' }}>
                          <Autocomplete
                            size="small"
                            value={categoryDetailSelections[categoryId] || null}
                            onChange={(event, newValue) => handleCategoryDetailChange(categoryId, newValue)}
                            options={detailOptions}
                            getOptionLabel={(option) => option.nome || ''}
                            disabled={!isSelected}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Dettagli"
                                variant="outlined"
                                size="small"
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sezione Categorie Quyen Vu Khi */}
        {categoriesByType[2].length > 0 && (
          <div className="drawer-section">
            <h3 className="drawer-section-title">Categorie Quyen Vu Khi</h3>
            <div className="drawer-section-content">
              {/* Esperienza separata se non merged */}
              {!canMergeQuyenTypes && quyenExperiences.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <Autocomplete
                    size="small"
                    value={selectedExperiences[2] || null}
                    onChange={(event, newValue) => handleExperienceChange(2, newValue)}
                    options={quyenExperiences}
                    getOptionLabel={(option) => option.nome || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Livello Esperienza"
                        variant="outlined"
                        required={hasSelectedQuyenCategories}
                        size="small"
                      />
                    )}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoriesByType[2].map(category => {
                  const categoryId = category.configTipoCategoria;
                  const details = categoryDetails[categoryId];
                  const isSelected = selectedCategories.includes(categoryId);
                  const detailOptions = getCategoryDetailOptions(categoryId);

                  return (
                    <div
                      key={categoryId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '12px',
                        backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(categoryId)}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                      <div style={{ flex: 1, fontWeight: '500' }}>
                        {details?.nome || 'Categoria'}
                      </div>
                      {detailOptions.length > 0 && (
                        <div style={{ minWidth: '200px' }}>
                          <Autocomplete
                            size="small"
                            value={categoryDetailSelections[categoryId] || null}
                            onChange={(event, newValue) => handleCategoryDetailChange(categoryId, newValue)}
                            options={detailOptions}
                            getOptionLabel={(option) => option.nome || ''}
                            disabled={!isSelected}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Dettagli"
                                variant="outlined"
                                size="small"
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sezione Categorie Combattimento */}
        {categoriesByType[3].length > 0 && (
          <div className="drawer-section">
            <h3 className="drawer-section-title">Categorie Combattimento</h3>
            <div className="drawer-section-content">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                {/* Esperienza Combattimento */}
                {availableExperiencesByType[3]?.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <Autocomplete
                      size="small"
                      value={selectedExperiences[3] || null}
                      onChange={(event, newValue) => handleExperienceChange(3, newValue)}
                      options={availableExperiencesByType[3]}
                      getOptionLabel={(option) => option.nome || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Livello Esperienza"
                          variant="outlined"
                          required={hasSelectedFightCategories}
                          size="small"
                        />
                      )}
                    />
                  </div>
                )}
                {/* Campo peso */}
                {hasWeightRequirement && (
                  <div style={{ width: '200px' }}>
                    <TextField
                      size="small"
                      label="Peso (kg)"
                      type="number"
                      value={weight}
                      onChange={handleWeightChange}
                      disabled={!selectedRequiresWeight}
                      variant="outlined"
                      inputProps={{ step: '0.1', min: '0' }}
                      fullWidth
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoriesByType[3].map(category => {
                  const categoryId = category.configTipoCategoria;
                  const details = categoryDetails[categoryId];
                  const isSelected = selectedCategories.includes(categoryId);

                  return (
                    <div
                      key={categoryId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '12px',
                        backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(categoryId)}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                      <div style={{ flex: 1, fontWeight: '500' }}>
                        {details?.nome || 'Categoria'}
                        {category.costo && (
                          <Chip
                            label={`€ ${parseFloat(category.costo).toFixed(2)}`}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: '20px' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Riepilogo selezione */}
        {/* {selectedCategories.length > 0 && (
          <div className="drawer-section">
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f7ff',
              borderRadius: '8px',
              border: '1px solid #1976d2',
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>📋 Riepilogo selezione</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Categorie selezionate: {selectedCategories.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Costo totale: € {selectedCategories.reduce((total, catId) => {
                  const category = availableCategories.find(c => c.configTipoCategoria === catId);
                  return total + (category?.costo ? parseFloat(category.costo) : 0);
                }, 0).toFixed(2)}
              </div>
            </div>
          </div>
        )} */}
      </>
    );
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Iscrizione di ${athlete?.nome || ''} ${athlete?.cognome || ''}`}
      subtitle={competition?.descrizione}
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {onDelete && (
              <Button
                onClick={() => setIsDeleteConfirmModalOpen(true)}
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Elimina iscrizione
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={loading || selectedCategories.length === 0}
            >
              Salva Modifiche
            </Button>
          </Box>
        </Box>
      }
    >
      {renderContent()}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isDeleteConfirmModalOpen && (
        <ConfirmActionModal
          open={isDeleteConfirmModalOpen}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          title="Conferma Eliminazione"
          message={`Sei sicuro di voler eliminare l'iscrizione di ${athlete?.nome} ${athlete?.cognome}? Verranno eliminate tutte le categorie associate.`}
          primaryButton={{
            text: 'Elimina',
            onClick: async () => { 
              await handleDelete(); 
              setIsDeleteConfirmModalOpen(false); 
            },
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setIsDeleteConfirmModalOpen(false),
          }}
        />
      )}
    </DrawerModal>
  );
};

export default RegistrationModal;
