import React, { useState, useEffect } from 'react';
import './styles/AthleteRegistration.css';
import {
  TextField,
  Autocomplete,
  Typography,
  Tooltip
} from '@mui/material';
import MuiButton from '@mui/material/Button';
import HorizontalStepper from './common/HorizontalStepper';
import ConfirmActionModal from './common/ConfirmActionModal';
import Button from './common/Button';
import {
  loadAthleteTypes,
  loadExperienceById,
  loadCategoryTypeById,
  loadAthleteTypeById
} from '../api/config';
import { createRegistration } from '../api/registrations';
import { uploadCertificato, downloadCertificato } from '../api/certificati';
import { updateAthlete } from '../api/athletes';
import { FiAlertCircle, FiUser, FiCheckCircle, FiDownload, FiUpload } from 'react-icons/fi';
import { MembershipType } from '../constants/enums/CompetitionEnums';
import { CompetitionTipology } from '../constants/enums/CompetitionEnums';
import { checkCategoryConstraints } from '../utils/helperRegistration';

/**
 * Componente per la gestione delle iscrizioni degli atleti alle competizioni
 * 
 * @param {Object} props
 * @param {Object} props.athlete - Dati dell'atleta da iscrivere
 * @param {Object} props.competition - Dati della competizione
 * @param {function} props.onRegistrationComplete - Callback chiamata quando l'iscrizione è completata
 * @param {function} props.onCancel - Callback chiamata quando si annulla l'iscrizione
 * @param {boolean} props.fullWidth - Se true, il componente occupa tutta la larghezza disponibile
 */
const AthleteRegistration = ({
  athlete,
  competition,
  onUpdateAthlete,
  onRegistrationComplete,
  onCancel,
  fullWidth = false
}) => {
  // Stato stepper
  const [activeStep, setActiveStep] = useState(0);

  // Stato fase 1 - Dati atleta
  const [cardNumber, setCardNumber] = useState(athlete?.numeroTessera || '');
  const [endDateCertificate, setEndDateCertificate] = useState(athlete?.scadenzaCertificato || '');
  const [certificatoId, setCertificatoId] = useState(athlete?.certificatoId ? "Certificato presente" : null);
  const [athleteType, setAthleteType] = useState(null);
  const [athleteTypes, setAthleteTypes] = useState([]);
  const [tesseramento, setTesseramento] = useState(null);
  const tesseramentoTypes = [
    { id: MembershipType.FIWUK, nome: 'FIWUK' },
    { id: MembershipType.ASI, nome: 'ASI' },
    { id: MembershipType.REQUEST, nome: 'Richiedi tesseramento' }
  ];

  // Stato fase 2 - Categorie
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState({});
  const [categoryDetailSelections, setCategoryDetailSelections] = useState({});
  const [weight, setWeight] = useState('');
  const [selectedExperiences, setSelectedExperiences] = useState({});
  const [availableExperiencesByType, setAvailableExperiencesByType] = useState({});

  // Stati generali
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Configurazione stepper
  const steps = [
    { label: 'Dati atleta', number: 1 },
    { label: 'Selezione categorie', number: 2 }
  ];

  // Gestione modifica numero tessera
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    // Accetta solo numeri e massimo 8 caratteri
    if (value === '' || (/^\d+$/.test(value) && value.length <= 8)) {
      setCardNumber(value);
    }
  };

  // Gestione modifica scadenza certificato
  const handleEndCertificateChange = (e) => {
    const value = e.target.value;
    setEndDateCertificate(value);
  };

  // Gestione modifica tipo atleta
  const handleAthleteTypeChange = (event, newValue) => {
    setAthleteType(newValue);
  };

  // Gestione modifica tesseramento
  const handleTesseramentoChange = (event, newValue) => {
    setTesseramento(newValue);
  };

  // Gestione download certificato
  const handleDownloadCertificate = async () => {
    try {
      const blob = await downloadCertificato(athlete.id);
      const url = window.URL.createObjectURL(blob);
      const fileType = blob.type || 'application/pdf';
      const fileExtension = fileType.split('/')[1] || 'pdf';
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificato_${athlete.cognome}_${athlete.nome}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrors(['Errore durante il download del certificato', err.response?.data?.message || err.message]);
    }
  };

  // Gestione upload certificato
  const handleUploadCertificate = () => {
    // Crea un input file temporaneo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Verifica dimensione (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setErrors([`Il file è troppo grande. Dimensione massima: 10MB`]);
          return;
        }

        // Verifica tipo file
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          setErrors(['Formato non supportato. Sono accettati solo PDF e immagini (JPG, PNG)']);
          return;
        }

        try {
          setLoading(true);
          await uploadCertificato(athlete.id, file);
          setCertificatoId(`certificato_${athlete.cognome}_${athlete.nome}`);
          setErrors([]);
          if (onUpdateAthlete)
            onUpdateAthlete();
        } catch (err) {
          setErrors(['Errore durante il caricamento del certificato', err.response?.data?.message || err.message]);
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  // Carica i dati iniziali dell'atleta
  useEffect(() => {
    const loadAthleteData = async () => {
      if (athlete?.tipoAtletaId) {
        try {
          const athleteType = await loadAthleteTypeById(athlete.tipoAtletaId);
          setAthleteType(athleteType);
        } catch (err) {
          console.error('Errore caricamento dati atleta:', err);
          setErrors(['Errore nel caricamento dei dati dell\'atleta', err.response?.data?.message || err.message]);
        }
      }
    };

    loadAthleteData();
  }, [athlete]);

  // Carica le esperienze disponibili dalla competizione
  useEffect(() => {
    let isMounted = true;
    
    const loadExperiences = async () => {
      if (!athlete?.tipoAtletaId || !competition?.categorieAtleti) {
        return;
      }

      const athleteConfig = competition.categorieAtleti.find(
        ca => ca.idTipoAtleta === athlete.tipoAtletaId
      );

      if (!athleteConfig?.esperienzaCategorie) {
        if (isMounted) {
          setAvailableExperiencesByType({});
        }
        return;
      }

      try {
        const experiencesByType = {};
        
        // Per ogni tipo competizione, carica le esperienze
        for (const expConfig of athleteConfig.esperienzaCategorie) {
          if (!isMounted) return;
          
          const tipoCompId = expConfig.configTipoCompetizione;
          const experienceIds = expConfig.idEsperienza || [];
          
          // Carica i dettagli di ogni esperienza
          const experiences = [];
          for (const expId of experienceIds) {
            if (!isMounted) return;
            
            try {
              const experience = await loadExperienceById(expId);
              experiences.push(experience);
            } catch (error) {
              console.error(`Errore nel caricamento esperienza ${expId}:`, error);
            }
          }
          
          experiencesByType[tipoCompId] = experiences;
        }
        
        if (isMounted) {
          setAvailableExperiencesByType(experiencesByType);
        }
      } catch (err) {
        console.error('Errore caricamento esperienze:', err);
      }
    };

    loadExperiences();
    
    return () => {
      isMounted = false;
    };
  }, [athlete?.tipoAtletaId, competition]);

  // Carica le categorie disponibili per l'atleta
  useEffect(() => {
    let isMounted = true;
    
    const loadCategories = async () => {
      if (!competition?.categorieAtleti || !athlete?.tipoAtletaId) {
        return;
      }

      const athleteConfig = competition.categorieAtleti.find(
        ca => ca.idTipoAtleta === athlete.tipoAtletaId
      );

      if (!athleteConfig) {
        if (isMounted) {
          setAvailableCategories([]);
        }
        return;
      }

      const categories = athleteConfig.categorie || [];
      if (isMounted) {
        setAvailableCategories(categories);
      }

      // Carica i dettagli di ogni categoria
      const details = {};
      for (const category of categories) {
        if (!isMounted) return;
        
        try {
          const categoryDetail = await loadCategoryTypeById(category.configTipoCategoria);
          details[category.configTipoCategoria] = { ...categoryDetail, ...category };
        } catch (err) {
          console.error('Errore nel caricamento dettagli categoria:', err);
        }
      }
      
      if (isMounted) {
        setCategoryDetails(details);
      }
    };

    loadCategories();
    
    return () => {
      isMounted = false;
    };
  }, [competition, athlete?.tipoAtletaId]);

  useEffect(() => {
    const fetchAthleteTypes = async () => {
      try {
        const types = await loadAthleteTypes();
        setAthleteTypes(types);
      } catch (err) {
        console.error('Errore nel caricamento dei tipi di atleta:', err);
      }
    };

    fetchAthleteTypes();
  }, []);

  // Valida la fase corrente
  const validateCurrentPhase = () => {
    const newErrors = [];

    switch (activeStep) {
      case 0:
        // Fase 1: dati atleta
        if (!cardNumber) {
          newErrors.push('Inserisci il numero di tessera dell\'atleta');
        }
        if (!athleteType) {
          newErrors.push('Seleziona la tipologia di atleta');
        }
        if (!tesseramento) {
          newErrors.push('Seleziona il tesseramento dell\'atleta');
        }
        if (!endDateCertificate) {
          newErrors.push('Inserisci la scadenza del certificato medico');
        }
        if (certificatoId === null) {
          newErrors.push('Carica il certificato medico dell\'atleta');
        }
        break;

      case 1:
        // Fase 2: categorie ed esperienze
        if (competition?.maxCategorieAtleta && selectedCategories.length > competition.maxCategorieAtleta) {
          newErrors.push(`Puoi selezionare al massimo ${competition.maxCategorieAtleta} categorie per questa competizione.`);
        }

        if (selectedCategories.length === 0) {
          newErrors.push('Seleziona almeno una categoria per l\'iscrizione.');
        }

        if (checkCategoryRequiresWeight && (!weight || parseFloat(weight) <= 0)) {
          newErrors.push('Il peso è obbligatorio per almeno una delle categorie selezionate');
        }

        for (const categoryId of selectedCategories) {
          const options = getCategoryDetailOptions(categoryId);
          if (options.length > 0 && !categoryDetailSelections[categoryId]) {
            newErrors.push('Seleziona i dettagli per tutte le categorie selezionate.');
            break;
          }

          const details = categoryDetails[categoryId];
          if (details?.tipoCompetizioneId) {
            const tipoCompId = details.tipoCompetizioneId;
            if (!selectedExperiences[tipoCompId]) {
              newErrors.push('Seleziona il livello di esperienza per tutte le categorie selezionate.');
              break;
            }
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Verifica peso se obbligatorio per le categorie selezionate
  const checkCategoryRequiresWeight = selectedCategories.some(catId => {
    const category = categoryDetails[catId];
    return category?.obbligoPeso;
  });

  // Gestisce eventuali operazioni specifiche della fase corrente
  const manageCurrentPhase = async () => {
    try {
      switch (activeStep) {
        case 0:
          // Fase 1: aggiorna i dati dell'atleta
          if (!athlete || !athlete.id) {
            throw new Error('Dati atleta non validi');
          }
          
          const updateData = {
            ...athlete,
            numeroTessera: cardNumber,
            tipoAtleta: athleteType ? athleteType : null,
            tipoAtletaId: athleteType && athleteType.id ? athleteType.id : null,
            scadenzaCertificato: endDateCertificate
          };
          
          await updateAthlete(athlete.id, updateData);
          
          if (onUpdateAthlete && typeof onUpdateAthlete === 'function') {
            onUpdateAthlete();
          }
          break;
        case 1:
          // Fase 2: nessuna operazione specifica
          break;
        default:
          break;
      }
      return true;
    } catch (err) {
      setErrors(['Errore durante l\'aggiornamento delle informazioni atleta. Riprova.', err.response?.data?.message || err.message]);
      return false;
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

  // Funzione helper per ottenere le opzioni di una categoria
  const getCategoryDetailOptions = (categoryId) => {
    return CategoryDetailOptions[categoryId] || [];
  };

  // Naviga allo step successivo
  const handleNext = async () => {
    try {
      if (!validateCurrentPhase()) {
        return;
      }
      
      const success = await manageCurrentPhase();
      if (success) {
        setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
        setErrors([]);
      }
    } catch (err) {
      setErrors([
        'Si è verificato un errore imprevisto. Per favore riprova.',
        err && err.message ? err.message : 'Errore sconosciuto'
      ]);
    }
  };

  // Naviga allo step precedente
  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    setErrors([]);
  };

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

  // Invia l'iscrizione
  const handleSubmit = async () => {
    if (!validateCurrentPhase()) {
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Crea un'iscrizione per ogni categoria selezionata
      const registrations = selectedCategories.map(categoryId => {
        const category = categoryDetails[categoryId];
        let quyenCategoryDetails = null;
        if (categoryDetailSelections[categoryId]) {
          quyenCategoryDetails = {nome: categoryDetailSelections[categoryId].value};
        }

        return {
          atletaId: athlete.id,
          tesseramento,
          tipoCategoriaId: categoryId,
          competizioneId: competition.id,
          idConfigEsperienza: selectedExperiences[category.tipoCompetizioneId]?.id || null,
          dettagliCategoria: quyenCategoryDetails,
          peso: weight && category?.obbligoPeso ? parseFloat(weight) : null,
        };
      });

      // Invia tutte le iscrizioni in parallelo
      await Promise.all(
        registrations.map(reg => createRegistration(reg))
      );

      // Mostra il modale di successo
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Errore durante l\'iscrizione:', err);
      setErrors(['Errore durante l\'iscrizione. Verifica i dati e riprova.', err.response?.data?.message || err.message]);
    } finally {
      setLoading(false);
    }
  };

  // Chiude il modale di successo e notifica il completamento
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (onRegistrationComplete) {
      onRegistrationComplete();
    }
  };

  // Renderizza il contenuto della fase 1
  const renderPhase1 = () => (
    <div className="phase-container">
      <h3 className="phase-title">
        <FiUser className="section-title-icon" />
        Verifica dati atleta
      </h3>
      <p className="phase-description">
        Controlla che i dati dell'atleta siano corretti prima di procedere con l'iscrizione.
      </p>

      <div className="data-section">
        <h4 className="section-title">Info: Viet Vo Dao Italia</h4>
        <div className="data-row">
          <div className="data-field">
            <TextField
              name="numeroTessera"
              label="Numero Tessera"
              type='text'
              inputProps={{ maxLength: 8 }}
              value={cardNumber}
              onChange={handleCardNumberChange}
              fullWidth
              required
              size="small"
            />
          </div>
          <div className="data-field">
            <Autocomplete
              id="livelloAtleta"
              value={athleteType || null}
              getOptionLabel={(option) => option.nome || ''}
              onChange={handleAthleteTypeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipologia Atleta"
                  variant="outlined"
                  required
                  size="small"
                />
              )}
              options={athleteTypes}
            />
          </div>
        </div>
      </div>

      <div className="data-section">
        <h4 className="section-title">Info : Tesseramento assicurativo</h4>
        <div className="data-row">
          <div className="data-field">
            <TextField
              name="scadenzaCertificato"
              label="Scadenza Certificato Medico"
              type="date"
              value={endDateCertificate || ''}
              onChange={handleEndCertificateChange}
              fullWidth
              required
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
          <div className="data-field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <Typography sx={{ whiteSpace: 'nowrap' }}>
              <strong>File:</strong> {certificatoId || 'Nessun file caricato'}
            </Typography>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
              {certificatoId && (
                <Tooltip title="Scarica certificato" arrow>
                  <MuiButton
                    size="small"
                    variant="outlined"
                    sx={{ p: 0.5, minWidth: 20 }}
                    onClick={() => handleDownloadCertificate()}
                  >
                    <FiDownload size={20} />
                  </MuiButton>
                </Tooltip>

              )}
              <Tooltip title="Carica certificato" arrow>
                <MuiButton
                  size="small"
                  variant="outlined"
                  sx={{ p: 0.5, minWidth: 20 }}
                  onClick={() => handleUploadCertificate()}
                >
                  <FiUpload size={20} />
                </MuiButton>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="data-row">
          <div className="data-field">
            <Autocomplete
              id="tesseramentoAtleta"
              value={tesseramento}
              getOptionLabel={(option) => option.nome || ''}
              onChange={handleTesseramentoChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tesseramento Atleta"
                  variant="outlined"
                  required
                  size="small"
                />
              )}
              options={tesseramentoTypes}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizza il contenuto della fase 2
  const renderPhase2 = () => {
    // Verifica che i dati siano caricati
    const isLoadingCategories = availableCategories.length > 0 && Object.keys(categoryDetails).length === 0;
    
    if (isLoadingCategories) {
      return (
        <div className="phase-container">
          <h3 className="phase-title">
            <FiCheckCircle className="section-title-icon" />
            Selezione categorie
          </h3>
          <p>Caricamento categorie in corso...</p>
        </div>
      );
    }
    
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
    
    // Identifica quali tipi competizione hanno categorie
    const competitionTypesPresent = [];
    if (categoriesByType[1].length > 0 || categoriesByType[2].length > 0) {
      competitionTypesPresent.push({ id: canMergeQuyenTypes ? 'quyen_merged' : 1, name: 'Quyen / Quyen Vu Khi' });
    }
    if (categoriesByType[3].length > 0) {
      competitionTypesPresent.push({ id: 3, name: 'Combattimento' });
    }

    return (
      <div className="phase-container">
        <h3 className="phase-title">
          <FiCheckCircle className="section-title-icon" />
          Selezione categorie
        </h3>
        <p className="phase-description">
          Seleziona le categorie a cui vuoi iscrivere l'atleta.
        </p>

        {availableCategories.length === 0 ? (
          <div className="summary-info">
            <div className="summary-info-title">⚠️ Nessuna categoria disponibile</div>
            <div className="summary-info-item">
              Non ci sono categorie disponibili per questo atleta in questa competizione.
            </div>
          </div>
        ) : (
          <>
            {/* Autocomplete Esperienza condiviso per Quyen e Quyen Vu Khi */}
            {canMergeQuyenTypes && quyenExperiences.length > 0 && (
              <div className="data-section" style={{ marginBottom: '24px' }}>
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
                  style={{ maxWidth: '400px' }}
                />
              </div>
            )}

            {/* Sezione Categorie Quyen */}
            {categoriesByType[1].length > 0 && (
              <div className="data-section">
                <h4 className="section-title">Categorie Quyen</h4>
                
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
                      style={{ maxWidth: '400px' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(categoryId)}
                            style={{ cursor: 'pointer', width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <div style={{ fontWeight: '500' }}>
                            {details?.nome || 'Categoria'}
                          </div>
                        </div>
                        { /* Dettagli categoria */
                          detailOptions && detailOptions.length > 0 && (
                            <div style={{ flex: '0 1 400px', minWidth: '250px', maxWidth: '100%', marginLeft: 'auto' }}>
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
                          )
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sezione Categorie Quyen Vu Khi */}
            {categoriesByType[2].length > 0 && (
              <div className="data-section">
                <h4 className="section-title">Categorie Quyen Vu Khi</h4>
                
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
                      style={{ maxWidth: '400px' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(categoryId)}
                            style={{ cursor: 'pointer', width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <div style={{ fontWeight: '500' }}>
                            {details?.nome || 'Categoria'}
                          </div>
                        </div>
                        {detailOptions && detailOptions.length > 0 && (
                        <div style={{ flex: '0 1 400px', minWidth: '250px', maxWidth: '100%', marginLeft: 'auto' }}>
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
            )}

            {/* Sezione Categorie Combattimento */}
            {categoriesByType[3].length > 0 && (
              <div className="data-section">
                <h4 className="section-title">Categorie Combattimento</h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '8px'
                  }}>
                    {/* Esperienza Combattimento */}
                    {availableExperiencesByType[3]?.length > 0 && (
                      <div style={{ marginRight: '16px', width: '400px' }}>
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
                              required
                              size="small"
                            />
                          )}
                          style={{ maxWidth: '400px' }}
                        />
                      </div>
                    )}
                    {/* Campo peso - sempre in fondo alla sezione combattimento */}
                    {hasWeightRequirement && (
                      <div style={{ marginLeft: 'auto' }}>
                        <TextField
                          size="small"
                          label="Peso (kg)"
                          type="number"
                          value={weight}
                          onChange={handleWeightChange}
                          disabled={!selectedRequiresWeight}
                          variant="outlined"
                          inputProps={{ step: '0.1', min: '0' }}
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                    )}
                  </div>
            
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categoriesByType[3].map(category => {
                    const categoryId = category.configTipoCategoria;
                    const details = categoryDetails[categoryId];
                    const isSelected = selectedCategories.includes(categoryId);

                    return (
                      <div
                        key={categoryId}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(categoryId)}
                            style={{ cursor: 'pointer', width: '20px', height: '20px', flexShrink: 0 }}
                          />
                          <div style={{ fontWeight: '500' }}>
                            {details?.nome || 'Categoria'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* {selectedCategories.length > 0 && (
          <div className="summary-info" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="summary-info-title">📋 Riepilogo selezione</div>
            <div className="summary-info-item">
              Categorie selezionate: {selectedCategories.length}
            </div>
            <div className="summary-info-item">
              Costo totale: € {selectedCategories.reduce((total, catId) => {
                const category = availableCategories.find(c => c.configTipoCategoria === catId);
                return total + (category?.costo ? parseFloat(category.costo) : 0);
              }, 0).toFixed(2)}
            </div>
          </div>
        )} */}
      </div>
    );
  };

  // Renderizza il contenuto della fase corrente
  const renderPhaseContent = () => {
    switch (activeStep) {
      case 0:
        return renderPhase1();
      case 1:
        return renderPhase2();
      default:
        return null;
    }
  };

  return (
    <div className={`athlete-registration ${fullWidth ? 'fullwidth' : ''}`}>
      {/* Header */}
      <div className="registration-header">
        <h2 className="registration-title">
          Iscrizione {athlete?.nome} {athlete?.cognome}
        </h2>
        {competition?.descrizione && (
          <p className="registration-subtitle">
            {competition?.descrizione}
          </p>
        )}
      </div>

      {/* Stepper */}
      <HorizontalStepper
        steps={steps}
        activeStep={activeStep}
      />

      {/* Contenuto fase corrente */}
      <div className="registration-content">
        {renderPhaseContent()}
      </div>

      {/* Zona errori */}
      <div className={`error-zone ${errors.length === 0 ? 'hidden' : ''}`}>
        <FiAlertCircle className="error-icon" />
        <div className="error-content">
          <div className="error-title">Attenzione</div>
          <ul className="error-messages">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Azioni */}
      <div className="registration-actions">
        <div className="actions-left">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annulla
          </Button>
        </div>
        <div className="actions-right">
          {activeStep > 0 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={loading}
            >
              Indietro
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
            >
              Avanti
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || selectedCategories.length === 0}
            >
              {loading ? 'Invio in corso...' : 'Conferma iscrizione'}
            </Button>
          )}
        </div>
      </div>

      {/* Modale di conferma */}
      <ConfirmActionModal
        open={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Iscrizione completata!"
        message={`L'atleta ${athlete?.nome} ${athlete?.cognome} è stato iscritto con successo a ${selectedCategories.length} categoria/e.`}
        primaryButton={{
          text: 'OK',
          onClick: handleSuccessModalClose,
          variant: 'primary'
        }}
      />
    </div>
  );
};

export default AthleteRegistration;
