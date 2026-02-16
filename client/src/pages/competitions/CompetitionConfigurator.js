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
import GeneralInfoTab from '../../components/competition-tabs/GeneralInfoTab';
import CategoriesTab from '../../components/competition-tabs/CategoriesTab';
import CostsTab from '../../components/competition-tabs/CostsTab';
import Tabs from '../../components/common/Tabs';

const CompetitionConfigurator = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [currentTab, setCurrentTab] = useState("general");
  const [formData, setFormData] = useState({
    nome: '',
    dataInizio: '',
    dataFine: '',
    tipiCompetizione: [],
    categorieAtleti: [],
    livello: CompetitionLevel.REGIONAL,
    stato: CompetitionStatus.PLANNED,
    dataScadenzaIscrizioni: '',
    maxCategorieAtleta: 5,
    maxPartecipanti: null,
    luogo: '',
    indirizzo: '',
    descrizione: '',
    costiIscrizione: null,
    iban: '',
    intestatario: '',
    causale: '',
  });
  const [editConfirmModalOpen, setEditConfirmModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Configurazione dei tabs
  const generationTabs = [
    { label: 'Informazioni Generali', value: 'general', disabled: false },
    { label: 'Categorie', value: 'categories', disabled: false },
    { label: 'Costi', value: 'costs', disabled: false },
  ];

  const handleGoBack = () => {
    navigate('/competitions');
  };

  const handleTabChange = (tabValue) => {
    setCurrentTab(tabValue);
  };

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
            tipiCompetizione: competition.tipiCompetizione || [],
            categorieAtleti: competition.categorieAtleti || [],
            livello: competition.livello || CompetitionLevel.REGIONAL,
            dataScadenzaIscrizioni: competition.dataScadenzaIscrizioni ? competition.dataScadenzaIscrizioni.split('T')[0] : '',
            luogo: competition.luogo || '',
            indirizzo: competition.indirizzo || '',
            stato: competition.stato || CompetitionStatus.PLANNED,
            descrizione: competition.descrizione || '',
            maxCategorieAtleta: competition.maxCategorieAtleta || 5,
            maxPartecipanti: competition.maxPartecipanti || null,
            costiIscrizione: competition.costiIscrizione || null,
            iban: competition.iban || '',
            intestatario: competition.intestatario || '',
            causale: competition.causale || '',
          });
        } catch (err) {
          setError('Errore nel caricamento della competizione');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCompetition();
  }, [id, isEditMode]);

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCategoriesChange = (categoriesData) => {
    const newFormData = {
      ...formData,
      categorieAtleti: categoriesData.categorieAtleti,
      tipiCompetizione: categoriesData.tipiCompetizione || [],
    };
    setFormData(newFormData);
  };

  const handleCostsChange = (costiIscrizione, iban, intestatario, causale) => {
    setFormData({
      ...formData,
      costiIscrizione,
      iban,
      intestatario,
      causale,
    });
  };

  const handleSubmit = async () => {
    setError('');
    setEditConfirmModalOpen(false);
    setLoading(true);
    
    try {
      if (formData.id) {
        await updateCompetition(formData.id, formData);
      } else {
        await createCompetition(formData);
      }
      navigate('/competitions');
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio');
      setLoading(false);
    }
  };

  const handleGeneralInfoSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      setEditConfirmModalOpen(true);
    } else {
      setCurrentTab('categories');
    }
  };

  const handleCategoriesSubmit = (e) => {
    if (isEditMode) {
      setEditConfirmModalOpen(true);
    } else {
      setCurrentTab('costs');
    }
  };

  const handleCostsSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      setEditConfirmModalOpen(true);
    } else {
      handleSubmit();
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

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title="Configurazione Competizione"
        subtitle={isEditMode ? `Modifica competizione: ${formData.nome || ''}` : `Nuova competizione`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna alle Competizioni
      </MuiButton>
    
      {/* Messaggi di errore e successo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs tabs={generationTabs} activeTab={currentTab} onTabChange={handleTabChange}>
        {/* Tab Panel - Info generali */}
        { currentTab === "general" && (
          <GeneralInfoTab
            formData={formData}
            onChange={handleFieldChange}
            onSubmit={handleGeneralInfoSubmit}
          />
        )}
        {/* Tab Panel - Categorie e gradi tecnici */}
        { currentTab === "categories" && (
          <CategoriesTab
            value={{
              categorieAtleti: formData.categorieAtleti,
              tipiCompetizione: formData.tipiCompetizione,
            }}
            onChange={handleCategoriesChange}
            onSubmit={handleCategoriesSubmit}
            isEditMode={isEditMode}
          />
        )}
        {/* Tab Panel - Costi */}
        { currentTab === "costs" && (
          <CostsTab
            value={{
              costiIscrizione: formData.costiIscrizione,  
              iban: formData.iban,
              intestatario: formData.intestatario,
              causale: formData.causale,
            }} 
            onChange={handleCostsChange}
            onSubmit={handleCostsSubmit}
          />
        )}
      </Tabs>
      { editConfirmModalOpen && (
        <ConfirmActionModal
          open={editConfirmModalOpen}
          title="Conferma Modifiche"
          message="Sei sicuro di voler salvare le modifiche apportate alla competizione?"
          primaryButton={{
            text: 'Salva Modifiche',
            onClick: async () => { await handleSubmit();},
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setEditConfirmModalOpen(false),
          }}
        />
      )}
    </div>
  );

  //   <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
  //     <AppBar position="static" color="default" elevation={0} sx={{ mb: 3, borderRadius: 1 }}>
  //       <Toolbar>
  //         <Button
  //           startIcon={<ArrowBackIcon />}
  //           onClick={() => navigate(-1)}
  //           sx={{ mr: 2 }}
  //           disabled={loading}
  //         >
  //           Indietro
  //         </Button>
  //         <Typography variant="h6" sx={{ flexGrow: 1 }}>
  //           {isEditMode ? 'Modifica Competizione' : 'Nuova Competizione'}
  //         </Typography>
  //         <Button
  //           variant="contained"
  //           startIcon={<SaveIcon />}
  //           onClick={handleSubmit}
  //           disabled={loading}
  //         >
  //           {isEditMode ? 'Salva Modifiche' : 'Crea Competizione'}
  //         </Button>
  //       </Toolbar>
  //     </AppBar>

  //     {error && (
  //       <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
  //         {error}
  //       </Alert>
  //     )}

  //     <Paper sx={{ width: '100%' }}>
  //       <Tabs
  //         value={currentTab}
  //         onChange={handleTabChange}
  //         variant="fullWidth"
  //         sx={{ borderBottom: 1, borderColor: 'divider' }}
  //       >
  //         <Tab icon={<InfoIcon />} label="Informazioni Generali" iconPosition="start" />
  //         <Tab icon={<CategoryIcon />} label="Categorie" iconPosition="start" />
  //         <Tab icon={<EuroIcon />} label="Costi" iconPosition="start" />
  //       </Tabs>

  //       <TabPanel value={currentTab} index={0}>
  //         <GeneralInfoTab
  //           formData={formData}
  //           onChange={handleFieldChange}
  //         />
  //       </TabPanel>

  //       <TabPanel value={currentTab} index={1}>
  //         <CategoriesTab
  //           value={{
  //             categorieAtleti: formData.categorieAtleti,
  //             tipiCompetizione: formData.tipiCompetizione,
  //           }}
  //           onChange={handleCategoriesChange}
  //           isEditMode={isEditMode}
  //         />
  //       </TabPanel>

  //       <TabPanel value={currentTab} index={2}>
  //         <CostsTab
  //           value={{
  //             costiIscrizione: formData.costiIscrizione,
  //             iban: formData.iban,
  //             intestatario: formData.intestatario,
  //             causale: formData.causale,
  //           }}
  //           onChange={handleCostsChange}
  //         />
  //       </TabPanel>
  //     </Paper>
  //   </Container>
  // );
};

export default CompetitionConfigurator;
