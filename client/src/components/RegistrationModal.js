import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Button,
  Autocomplete,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { editAthleteRegistrations } from '../api/registrations';
import DrawerModal from './common/DrawerModal';
import ConfirmActionModal from './common/ConfirmActionModal';
import { CompetitionTipology } from '../constants/enums/CompetitionEnums';
import { checkCategoryConstraints, getAthleteTypeConfig, loadRegistrationConfig } from '../utils/helperRegistration';
import './common/DrawerModal.css';

const getRegistrationCategoryId = (reg) => reg.tipoCategoria?.id || reg.tipoCategoriaId;

const RegistrationModal = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  athlete,
  registrations,
  competition,
}) => {
  // Configurazione della competizione per il tipo atleta
  const athleteConfig = useMemo(
    () => getAthleteTypeConfig(competition, athlete?.tipoAtletaId),
    [competition, athlete?.tipoAtletaId]
  );
  const availableCategories = useMemo(() => athleteConfig?.categorie || [], [athleteConfig]);

  // Dati di configurazione caricati (tramite cache)
  const [categoryDetails, setCategoryDetails] = useState({});
  const [availableExperiencesByType, setAvailableExperiencesByType] = useState({});
  const [categoryDetailOptions, setCategoryDetailOptions] = useState({});

  // Selezioni utente, inizializzate dalle iscrizioni esistenti
  const [selectedCategories, setSelectedCategories] = useState(
    () => (registrations || []).map(getRegistrationCategoryId).filter(Boolean)
  );
  const [categoryDetailSelections, setCategoryDetailSelections] = useState(() => {
    const detailSelections = {};
    (registrations || []).forEach(reg => {
      const catId = getRegistrationCategoryId(reg);
      if (reg.dettagli && catId) {
        detailSelections[catId] = reg.dettagli;
      }
    });
    return detailSelections;
  });
  const [weight, setWeight] = useState(
    () => (registrations || []).find(reg => reg.peso)?.peso?.toString() || ''
  );
  const [selectedExperiences, setSelectedExperiences] = useState({});

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carica i dati di configurazione (categorie, esperienze, dettagli categoria)
  useEffect(() => {
    if (!open || !athleteConfig) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const config = await loadRegistrationConfig(athleteConfig);
        if (!isMounted) return;

        setCategoryDetails(config.categoryDetails);
        setAvailableExperiencesByType(config.experiencesByType);
        setCategoryDetailOptions(config.detailOptionsByCategory);

        // Imposta le esperienze selezionate (raggruppa per tipoCompetizioneId, saranno tutte uguali)
        const experiences = {};
        (registrations || []).forEach(reg => {
          const tipoCompId = config.categoryDetails[getRegistrationCategoryId(reg)]?.tipoCompetizioneId;
          if (reg.esperienza && tipoCompId && !experiences[tipoCompId]) {
            experiences[tipoCompId] = reg.esperienza;
          }
        });
        setSelectedExperiences(experiences);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        if (isMounted) setError('Errore nel caricamento dei dati dell\'iscrizione');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [open, athleteConfig, registrations]);

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
        categoriesDetails: Object.fromEntries(
          Object.entries(categoryDetailSelections)
            .filter(([categoryId, detail]) => detail && selectedCategories.includes(Number(categoryId)))
            .map(([categoryId, detail]) => [categoryId, { id: detail.id, nome: detail.nome }])
        ),
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

  // Opzioni dettagli categoria (nomi quyen), presenti solo se configurato almeno un valore
  const getCategoryDetailOptions = (categoryId) => {
    return categoryDetailOptions[categoryId] || [];
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
                            isOptionEqualToValue={(option, value) => option.nome === value.nome}
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
                            isOptionEqualToValue={(option, value) => option.nome === value.nome}
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
                  <div style={{ flex: 1, maxWidth: '300px' }}>
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
