import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Alert, CircularProgress } from '@mui/material';
import { Button as MuiButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { FaTrophy } from 'react-icons/fa';
import { createCompetition, updateCompetition, getCompetitionDetails } from '../../api/competitions';
import { CompetitionStatus, CompetitionLevel } from '../../constants/enums/CompetitionEnums';
import PageHeader from '../../components/PageHeader';
import ConfirmActionModal from '../../components/common/ConfirmActionModal';
import HorizontalStepper from '../../components/common/HorizontalStepper';
import Button from '../../components/common/Button';
import GeneralInfoTab from '../../components/competition-tabs/GeneralInfoTab';
import AgeGroupsTab from '../../components/competition-tabs/AgeGroupsTab';
import CategoryMatrixTab from '../../components/competition-tabs/CategoryMatrixTab';
import ExperienceLevelsTab from '../../components/competition-tabs/ExperienceLevelsTab';
import CostsTab from '../../components/competition-tabs/CostsTab';
import ReviewTab from '../../components/competition-tabs/ReviewTab';
import { emptyCategoryConfig, pruneCategoryConfig } from '../../utils/competitionCategoryConfig';

// Form dello step corrente: il pulsante "Avanti" lo invia per sfruttare la validazione dei campi obbligatori
const STEP_FORM_ID = 'competition-step-form';

const STEPS = [
  { key: 'general', label: 'Informazioni Generali', usesForm: true },
  { key: 'ageGroups', label: "Fasce d'età" },
  { key: 'categories', label: 'Categorie' },
  { key: 'experiences', label: 'Livelli di esperienza' },
  { key: 'costs', label: 'Costi e pagamento', usesForm: true },
  { key: 'review', label: 'Riepilogo' },
];

const CompetitionConfigurator = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [activeStep, setActiveStep] = useState(0);
  // In creazione si può tornare solo agli step già visitati; in modifica tutti gli step sono navigabili
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [formData, setFormData] = useState({
    nome: '',
    dataInizio: '',
    dataFine: '',
    livello: CompetitionLevel.REGIONAL,
    stato: CompetitionStatus.PLANNED,
    dataScadenzaIscrizioni: '',
    maxCategorieAtleta: 5,
    maxCategorieTipoCompetizione: {},
    maxPartecipanti: null,
    luogo: '',
    indirizzo: '',
    descrizione: '',
    costiIscrizione: null,
    iban: '',
    intestatario: '',
    causale: '',
    ageGroupConfigurationId: null,
    categoryConfig: emptyCategoryConfig(),
  });
  // Configurazione fasce età effettiva (copia salvata o configurazione selezionata): definisce le colonne delle categorie
  const [ageGroupConfig, setAgeGroupConfig] = useState(null);
  // Dati fasce età in sola lettura (non inviati al salvataggio)
  const [ageGroupInfo, setAgeGroupInfo] = useState({
    savedConfiguration: null,
    savedConfig: null,
    organizerClubId: null,
    locked: false,
  });
  const [editConfirmModalOpen, setEditConfirmModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCompetition = async () => {
      if (isEditMode) {
        setLoading(true);
        try {
          const competition = await getCompetitionDetails(id);
          setFormData({
            id: competition.id,
            nome: competition.nome || '',
            dataInizio: competition.dataInizio ? competition.dataInizio.split('T')[0] : '',
            dataFine: competition.dataFine ? competition.dataFine.split('T')[0] : '',
            livello: competition.livello || CompetitionLevel.REGIONAL,
            dataScadenzaIscrizioni: competition.dataScadenzaIscrizioni ? competition.dataScadenzaIscrizioni.split('T')[0] : '',
            luogo: competition.luogo || '',
            indirizzo: competition.indirizzo || '',
            stato: competition.stato || CompetitionStatus.PLANNED,
            descrizione: competition.descrizione || '',
            maxCategorieAtleta: competition.maxCategorieAtleta || 5,
            maxCategorieTipoCompetizione: competition.maxCategorieTipoCompetizione || {},
            maxPartecipanti: competition.maxPartecipanti || null,
            costiIscrizione: competition.costiIscrizione || null,
            iban: competition.iban || '',
            intestatario: competition.intestatario || '',
            causale: competition.causale || '',
            ageGroupConfigurationId: competition.ageGroupConfigurationId || null,
            categoryConfig: competition.categoryConfig || emptyCategoryConfig(),
          });
          setAgeGroupConfig(competition.ageGroupConfig || null);
          setAgeGroupInfo({
            savedConfiguration: competition.ageGroupConfiguration || null,
            savedConfig: competition.ageGroupConfig || null,
            organizerClubId: competition.organizzatoreClubId || null,
            locked: (competition.categorie || []).length > 0,
          });
          setMaxVisitedStep(STEPS.length - 1);
        } catch (err) {
          setError({ message: 'Errore nel caricamento della competizione' });
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCompetition();
  }, [id, isEditMode]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Cambio configurazione fasce: le fasce non più presenti vengono tolte dalle categorie
  const handleAgeGroupConfigChange = (config) => {
    if (!config) return;
    setAgeGroupConfig(config);
    setFormData(prev => ({ ...prev, categoryConfig: pruneCategoryConfig(prev.categoryConfig, config) }));
  };

  const handleCostsChange = (costsData) => {
    setFormData(prev => ({ ...prev, ...costsData }));
  };

  // Validazione degli step senza form; restituisce il messaggio di errore o null
  const validateStep = (stepKey) => {
    switch (stepKey) {
      case 'ageGroups':
        return formData.ageGroupConfigurationId ? null : 'Seleziona la configurazione delle fasce d\'età';
      case 'categories':
        return (formData.categoryConfig?.categories || []).length > 0 ? null : 'Seleziona almeno una categoria';
      default:
        return null;
    }
  };

  const goToStep = (index) => {
    setError(null);
    setActiveStep(index);
    setMaxVisitedStep(prev => Math.max(prev, index));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const stepError = validateStep(STEPS[activeStep].key);
    if (stepError) {
      setError({ message: stepError });
      return;
    }
    goToStep(activeStep + 1);
  };

  const handleStepFormSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    handleNext();
  };

  const handleStepClick = (index) => {
    if (index <= maxVisitedStep) {
      goToStep(index);
    }
  };

  // Converte i limiti per tipo competizione in interi, scartando i campi vuoti (nessun limite)
  const normalizeTypeLimits = (limits) => {
    return Object.fromEntries(
      Object.entries(limits || {})
        .map(([typeId, max]) => [typeId, parseInt(max, 10)])
        .filter(([, max]) => Number.isInteger(max) && max > 0)
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setEditConfirmModalOpen(false);

    // Verifica gli step obbligatori prima del salvataggio
    for (let i = 0; i < STEPS.length; i++) {
      const stepError = validateStep(STEPS[i].key);
      if (stepError) {
        setActiveStep(i);
        setError({ message: stepError });
        return;
      }
    }

    setLoading(true);

    // I campi data non compilati restano '' nel form (input controllati): al backend vanno inviati come null
    // I tipi competizione vengono ricavati dal backend a partire dalle categorie
    const payload = {
      ...formData,
      dataScadenzaIscrizioni: formData.dataScadenzaIscrizioni || null,
      maxCategorieTipoCompetizione: normalizeTypeLimits(formData.maxCategorieTipoCompetizione),
    };

    try {
      if (payload.id) {
        await updateCompetition(payload.id, payload);
      } else {
        await createCompetition(payload);
      }
      navigate('/competitions');
    } catch (err) {
      setError({
        message: err.response?.data?.error || err.message || 'Errore durante il salvataggio',
        details: Array.isArray(err.response?.data?.details) ? err.response.data.details : [],
      });
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (isEditMode) {
      setEditConfirmModalOpen(true);
    } else {
      handleSubmit();
    }
  };

  const renderStepContent = () => {
    switch (STEPS[activeStep].key) {
      case 'general':
        return (
          <GeneralInfoTab
            formData={formData}
            onChange={handleFieldChange}
            onSubmit={handleStepFormSubmit}
            formId={STEP_FORM_ID}
          />
        );
      case 'ageGroups':
        return (
          <AgeGroupsTab
            value={formData.ageGroupConfigurationId}
            onChange={(configurationId) => handleFieldChange('ageGroupConfigurationId', configurationId)}
            onConfigChange={handleAgeGroupConfigChange}
            savedConfiguration={ageGroupInfo.savedConfiguration}
            savedConfig={ageGroupInfo.savedConfig}
            organizerClubId={ageGroupInfo.organizerClubId}
            locked={ageGroupInfo.locked}
            competitionStartDate={formData.dataInizio}
          />
        );
      case 'categories':
        return (
          <CategoryMatrixTab
            value={formData.categoryConfig}
            onChange={(categoryConfig) => handleFieldChange('categoryConfig', categoryConfig)}
            ageGroupConfig={ageGroupConfig}
          />
        );
      case 'experiences':
        return (
          <ExperienceLevelsTab
            value={formData.categoryConfig}
            onChange={(categoryConfig) => handleFieldChange('categoryConfig', categoryConfig)}
            ageGroupConfig={ageGroupConfig}
          />
        );
      case 'costs':
        return (
          <CostsTab
            value={{
              costiIscrizione: formData.costiIscrizione,
              iban: formData.iban,
              intestatario: formData.intestatario,
              causale: formData.causale,
            }}
            categoryConfig={formData.categoryConfig}
            onChange={handleCostsChange}
            onSubmit={handleStepFormSubmit}
            formId={STEP_FORM_ID}
          />
        );
      case 'review':
        return <ReviewTab formData={formData} ageGroupConfig={ageGroupConfig} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const currentStep = STEPS[activeStep];
  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title="Configurazione Competizione"
        subtitle={isEditMode ? `Modifica competizione: ${formData.nome || ''}` : `Nuova competizione`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={() => navigate('/competitions')}
      >
        Torna alle Competizioni
      </MuiButton>

      <div style={{ margin: '1.5rem 0 2rem' }}>
        <HorizontalStepper
          steps={STEPS.map((step, index) => ({ label: step.label, number: index + 1 }))}
          activeStep={activeStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Messaggi di errore */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: '1024px', mx: 'auto' }} onClose={() => setError(null)}>
          {error.message}
          {error.details?.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
              {error.details.map((detail, index) => <li key={index}>{detail}</li>)}
            </ul>
          )}
        </Alert>
      )}

      {renderStepContent()}

      {/* Navigazione */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <div style={{ maxWidth: '1024px', width: '100%', padding: '0 1rem', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outline-primary" size="m" onClick={() => goToStep(activeStep - 1)} disabled={activeStep === 0}>
            Indietro
          </Button>
          {isLastStep ? (
            <Button variant="primary" size="m" onClick={handleSave}>
              {isEditMode ? 'Salva modifiche' : 'Crea competizione'}
            </Button>
          ) : currentStep.usesForm ? (
            <Button variant="primary" size="m" type="submit" form={STEP_FORM_ID}>
              Avanti
            </Button>
          ) : (
            <Button variant="primary" size="m" onClick={handleNext}>
              Avanti
            </Button>
          )}
        </div>
      </div>

      {editConfirmModalOpen && (
        <ConfirmActionModal
          open={editConfirmModalOpen}
          title="Conferma Modifiche"
          message="Sei sicuro di voler salvare le modifiche apportate alla competizione?"
          primaryButton={{
            text: 'Salva Modifiche',
            onClick: handleSubmit,
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setEditConfirmModalOpen(false),
          }}
        />
      )}
    </div>
  );
};

export default CompetitionConfigurator;
