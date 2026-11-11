import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  TextField,
} from '@mui/material';
import { FaUsers } from 'react-icons/fa';
import { Add } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { loadAllAthletes, createAthlete, updateAthlete, deleteAthlete, loadAthletesByClub } from '../../api/athletes';
import { loadAllClubs } from '../../api/clubs';
import { loadAgeGroupConfigurations } from '../../api/ageGroupConfigurations';
import { resolveAgeGroup } from '../../utils/ageGroups';
import { todayYmd } from '../../components/AgeGroupConfigurationModal';
import AthletesTable from '../../components/AthletesTable';
import AthleteModal from '../../components/AthleteModal';
import CertificatoModal from '../../components/CertificatoModal';
import PageHeader from '../../components/PageHeader';
import { Button } from '../../components/common';
import ConfirmActionModal from '../../components/common/ConfirmActionModal';
import SearchTextField from '../../components/SearchTextField';
import '../styles/CommonPageStyles.css';

const Athletes = () => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [filteredAthletes, setFilteredAthletes] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [ageGroupConfigurations, setAgeGroupConfigurations] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    belt: '',
    club: '',
    gender: '',
    ageGroupConfigurationId: '',
    ageGroupKey: '',
    referenceDate: todayYmd()
  });
  const isAdmin = user && (user.permissions === 'admin' || user.permissions === 'superAdmin');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAthleteConfirmModalOpen, setIsDeleteAthleteConfirmModalOpen] = useState(false);
  const [isCertificatoModalOpen, setIsCertificatoModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadAthleteByUserPermissions();
      } catch (error) {
        console.error('Errore nel caricamento degli atleti:', error);
      }

      try {
        if (user && (user.permissions === 'admin' || user.permissions === 'superAdmin')) {
          const clubsData = await loadAllClubs();
          setClubs(clubsData);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei club:', error);
      }
    };

    fetchData();
  }, [user]);

  // Configurazioni fasce d'età disponibili (di default e del club; per l'admin quelle del club filtrato)
  useEffect(() => {
    if (!user) return;
    loadAgeGroupConfigurations(isAdmin ? (filters.club || null) : null)
      .then(setAgeGroupConfigurations)
      .catch(error => console.error('Errore nel caricamento delle configurazioni fasce età:', error));
  }, [user, isAdmin, filters.club]);

  const selectedAgeGroupConfig = useMemo(
    () => ageGroupConfigurations.find(c => c.id === filters.ageGroupConfigurationId)?.config || null,
    [ageGroupConfigurations, filters.ageGroupConfigurationId]
  );

  useEffect(() => {
    let result = athletes;

    if (filters.name) {
      result = result.filter(
        (athlete) =>
          `${athlete.nome} ${athlete.cognome}`
            .toLowerCase()
            .includes(filters.name.toLowerCase())
      );
    }

    if (filters.belt) {
      result = result.filter((athlete) => (filters.belt === 'CN') === !!athlete.isBlackBelt);
    }

    if (filters.club) {
      result = result.filter((athlete) => athlete.clubId === filters.club);
    }

    if (filters.gender) {
      result = result.filter((athlete) => athlete.sesso === filters.gender);
    }

    // Fascia d'età calcolata con la configurazione scelta alla data di riferimento
    if (selectedAgeGroupConfig && filters.ageGroupKey) {
      result = result.filter((athlete) =>
        resolveAgeGroup(athlete.dataNascita, selectedAgeGroupConfig, filters.referenceDate)?.key === filters.ageGroupKey
      );
    }

    setFilteredAthletes(result);
  }, [filters, athletes, selectedAgeGroupConfig, user]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAgeGroupConfigurationChange = (e) => {
    setFilters({ ...filters, ageGroupConfigurationId: e.target.value, ageGroupKey: '' });
  };

  const handleFilterNameChange = (e) => {
    setFilters({ ...filters, name: e.target.value });
  }

  const handleOpenModal = (athlete = null) => {
    setIsEditMode(!!athlete);
    setSelectedAthlete(athlete);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleOpenCertificatoModal = (athlete) => {
    setSelectedAthlete(athlete);
    setIsCertificatoModalOpen(true);
  };

  const handleCloseCertificatoModal = () => {
    setIsCertificatoModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleCertificatoSuccess = async () => {
    await loadAthleteByUserPermissions();
  };

  const handleSaveAthlete = async (athleteData) => {
    try {
      if (isEditMode) {
        await updateAthlete(athleteData.id, athleteData);
      } else {
        await createAthlete(athleteData);
      }

      await loadAthleteByUserPermissions();
      handleCloseModal();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteAthlete = async (athleteId) => {
    try {
      await deleteAthlete(athleteId);

      await loadAthleteByUserPermissions();
    } catch (error) {
      console.error("Errore nell'eliminazione dell'atleta:", error);
    }
  };

  const handleDeleteAthleteConfirm = (athlete) => {
    setSelectedAthlete(athlete);
    setIsDeleteAthleteConfirmModalOpen(true);
  };

  const loadAthleteByUserPermissions = async () => {
    if (user && (user.permissions === 'admin' || user.permissions === 'superAdmin')) {
      const athletesData = await loadAllAthletes();
      setAthletes(athletesData);
      setFilteredAthletes(athletesData);
    } else {
      const athletesData = await loadAthletesByClub(user.clubId);
      setAthletes(athletesData);
      setFilteredAthletes(athletesData);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PageHeader
        icon={FaUsers}
        title="Gestione Atleti"
      />

      {/* Contenuto della pagina */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="page-card" style={{ flexShrink: 0 }}>
          <div className="page-card-body">
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <SearchTextField
                value={filters.name}
                onChange={handleFilterNameChange}
                placeholder="Filtra per Nome/Cognome"
                sx={{
                  width: '100%',
                  maxWidth: "800px",
                  '& .MuiOutlinedInput-root': {
                    height: '60px',
                  }
                }}
              />
              <Button
                icon={Add}
                onClick={() => handleOpenModal()}
              >
                Aggiungi Atleta
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {isAdmin && (
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Filtra per Club</InputLabel>
                      <Select
                        name="club"
                        label="Filtra per Club"
                        value={filters.club}
                        onChange={handleFilterChange}
                      >
                        <MenuItem value="">
                          <em>Tutti</em>
                        </MenuItem>
                        {clubs.map((club) => (
                          <MenuItem key={club.id} value={club.id}>
                            {club.denominazione}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Cintura</InputLabel>
                    <Select
                      name="belt"
                      label="Cintura"
                      value={filters.belt}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value=""><em>Tutte</em></MenuItem>
                      <MenuItem value="CN">CN</MenuItem>
                      <MenuItem value="CB">CB</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Configurazione fasce d'età</InputLabel>
                    <Select
                      name="ageGroupConfigurationId"
                      label="Configurazione fasce d'età"
                      value={filters.ageGroupConfigurationId}
                      onChange={handleAgeGroupConfigurationChange}
                    >
                      <MenuItem value=""><em>Nessuna</em></MenuItem>
                      {ageGroupConfigurations.some(c => c.clubId !== null) && <ListSubheader>Configurazioni del club</ListSubheader>}
                      {ageGroupConfigurations.filter(c => c.clubId !== null).map((configuration) => (
                        <MenuItem key={configuration.id} value={configuration.id}>{configuration.name}</MenuItem>
                      ))}
                      <ListSubheader>Configurazioni di default</ListSubheader>
                      {ageGroupConfigurations.filter(c => c.clubId === null).map((configuration) => (
                        <MenuItem key={configuration.id} value={configuration.id}>{configuration.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {selectedAgeGroupConfig && (
                  <>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Fascia d'età</InputLabel>
                        <Select
                          name="ageGroupKey"
                          label="Fascia d'età"
                          value={filters.ageGroupKey}
                          onChange={handleFilterChange}
                        >
                          <MenuItem value=""><em>Tutte</em></MenuItem>
                          {selectedAgeGroupConfig.groups.map((group) => (
                            <MenuItem key={group.key} value={group.key}>{group.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        type="date"
                        name="referenceDate"
                        label="Data di riferimento"
                        value={filters.referenceDate}
                        onChange={(e) => setFilters({ ...filters, referenceDate: e.target.value || todayYmd() })}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

          </div>
        </div>

        <div className="page-card" style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* <div className="page-card-header">
            <h2 className="page-card-title">Titolo Card</h2>
          </div> */}
          <div className="page-card-body" style={{ flex: 1, overflow: 'auto' }}>
            <AthletesTable
              athletes={filteredAthletes.map(athlete => ({
                ...athlete,
                onUploadCertificato: handleOpenCertificatoModal,
                onDownloadCertificato: handleOpenCertificatoModal
              }))}
              onEdit={handleOpenModal}
              onDelete={handleDeleteAthleteConfirm}
            />

            {isModalOpen && (
              <AthleteModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveAthlete}
                onDelete={handleDeleteAthlete}
                isEditMode={isEditMode}
                athlete={selectedAthlete}
                clubs={clubs}
                userClubId={user?.clubId}
              />
            )}

            {isCertificatoModalOpen && (
              <CertificatoModal
                open={isCertificatoModalOpen}
                onClose={handleCloseCertificatoModal}
                atleta={selectedAthlete}
                onSuccess={handleCertificatoSuccess}
              />
            )}

            {isDeleteAthleteConfirmModalOpen && (
              <ConfirmActionModal
                open={isDeleteAthleteConfirmModalOpen}
                onClose={() => setIsDeleteAthleteConfirmModalOpen(false)}
                title="Conferma Eliminazione"
                message="Sei sicuro di voler eliminare l'atleta selezionato?"
                primaryButton={{
                  text: 'Elimina',
                  onClick: async () => { await handleDeleteAthlete(selectedAthlete); setIsDeleteAthleteConfirmModalOpen(false); },
                }}
                secondaryButton={{
                  text: 'Annulla',
                  onClick: () => setIsDeleteAthleteConfirmModalOpen(false),
                }}
              />
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Athletes;