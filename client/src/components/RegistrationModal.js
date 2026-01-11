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
import { loadCategoryTypeById, loadExperiencesByAthleteType } from '../api/config';
import DrawerModal from './common/DrawerModal';
import ConfirmActionModal from './common/ConfirmActionModal';
import { CompetitionTipology } from '../constants/enums/CompetitionEnums';
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
  
  // Stati per le esperienze
  const [availableExperiencesQuyen, setAvailableExperiencesQuyen] = useState([]);
  const [availableExperiencesFight, setAvailableExperiencesFight] = useState([]);
  
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
            if (categorieTipoAtleta.tipoAtletaId === athlete.tipoAtletaId && 
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

        // Imposta le categorie selezionate dalle iscrizioni esistenti
        if (registrations && registrations.length > 0) {
          const selectedCatIds = registrations.map(reg => reg.tipoCategoria?.id).filter(Boolean);
          setSelectedCategories(selectedCatIds);

          // Imposta i dettagli delle categorie selezionate
          const detailSelections = {};
          registrations.forEach(reg => {
            if (reg.dettagli && reg.tipoCategoria?.id) {
              detailSelections[reg.tipoCategoria.id] = reg.dettagli;
            }
          });
          setCategoryDetailSelections(detailSelections);

          // Imposta il peso se presente
          const registrationWithWeight = registrations.find(reg => reg.peso);
          if (registrationWithWeight) {
            setWeight(registrationWithWeight.peso.toString());
          }

          // Imposta le esperienze selezionate
          const experiences = {};
          registrations.forEach(reg => {
            if (reg.esperienza && reg.tipoCategoria) {
              const catDetail = details[reg.tipoCategoria.id];
              if (catDetail?.tipoCompetizioneId) {
                experiences[catDetail.tipoCompetizioneId] = reg.esperienza;
              }
            }
          });
          setSelectedExperiences(experiences);
        }

        // Carica le esperienze disponibili
        if (athlete.tipoAtletaId) {
          const experiences = await loadExperiencesByAthleteType(athlete.tipoAtletaId);
          
          const quyenExperiences = experiences.filter(exp => 
            exp.tipoCompetizioneId === CompetitionTipology.QUYEN || 
            exp.tipoCompetizioneId === CompetitionTipology.QUYENVUKHI
          );
          setAvailableExperiencesQuyen(quyenExperiences);

          const fightExperiences = experiences.filter(exp => 
            exp.tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO
          );
          setAvailableExperiencesFight(fightExperiences);
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
      // Prepara i dati da inviare
      const data = {
        selectedCategories,
        categoryDetailSelections,
        weight: weight || null,
        selectedExperiences,
      };
      
      await onSubmit(data);
    } catch (error) {
      setError(error.message || "Errore nel salvataggio dell'iscrizione");
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

  // Opzioni vuote per dettagli - da implementare con enum
  const getCategoryDetailOptions = (categoryId) => {
    return [];
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
      categoriesByType[details.tipoCompetizioneId].push(category);
    }
  });

  // Verifica se le esperienze per Quyen e Quyen Vu Khi sono le stesse
  const quyenExperiences = availableExperiencesQuyen;
  const canMergeQuyenTypes = categoriesByType[1].length > 0 && categoriesByType[2].length > 0;

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
                    required
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
                        required
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
                        required
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

        {/* Sezione Categorie Combattimento */}
        {categoriesByType[3].length > 0 && (
          <div className="drawer-section">
            <h3 className="drawer-section-title">Categorie Combattimento</h3>
            <div className="drawer-section-content">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                {/* Esperienza Combattimento */}
                {availableExperiencesFight.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <Autocomplete
                      size="small"
                      value={selectedExperiences[3] || null}
                      onChange={(event, newValue) => handleExperienceChange(3, newValue)}
                      options={availableExperiencesFight}
                      getOptionLabel={(option) => option.nome || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Livello Esperienza"
                          variant="outlined"
                          required
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
