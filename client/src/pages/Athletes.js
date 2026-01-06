import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { FaUsers } from 'react-icons/fa';
import { Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { loadAllAthletes, createAthlete, updateAthlete, deleteAthlete, loadAthletesByClub } from '../api/athletes';
import { loadAllClubs } from '../api/clubs';
import { loadAthleteTypes, loadAgeGroups } from '../api/config';
import AthletesTable from '../components/AthletesTable';
import AthleteModal from '../components/AthleteModal';
import CertificatoModal from '../components/CertificatoModal';
import AuthComponent from '../components/AuthComponent';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/common';
import '../pages/styles/CommonPageStyles.css';

const Athletes = () => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [filteredAthletes, setFilteredAthletes] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [athleteTypes, setAthleteTypes] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    club: '',
    gender: '',
    ageGroup: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
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
        const athleteTypesData = await loadAthleteTypes();
        setAthleteTypes(athleteTypesData);

        if (user && (user.permissions === 'admin' || user.permissions === 'superAdmin')) {
          const clubsData = await loadAllClubs();
          setClubs(clubsData);

          const ageGroupsData = await loadAgeGroups();
          setAgeGroups(ageGroupsData);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei tipi di atleta o dei club:', error);
      }
    };

    fetchData();
  }, [user]);

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

    if (filters.type) {
      result = result.filter((athlete) =>
        athlete.tipoAtletaId === parseInt(filters.type)
      );
    }

    if (filters.club) {
      result = result.filter((athlete) => athlete.clubId === filters.club);
    }

    if (filters.gender) {
      result = result.filter((athlete) => athlete.sesso === filters.gender);
    }

    if (filters.ageGroup) {
      const selectedAgeGroup = ageGroups.find(ag => ag.id === parseInt(filters.ageGroup));
      if (selectedAgeGroup) {
        result = result.filter((athlete) => {
          const birthDate = new Date(athlete.dataNascita);
          const today = new Date();

          // Se sono presenti inizioValidita e fineValidita, filtra per anno di nascita
          if (selectedAgeGroup.inizioValidita && selectedAgeGroup.fineValidita) {
            const startValidity = new Date(selectedAgeGroup.inizioValidita);
            const endValidity = new Date(selectedAgeGroup.fineValidita);
            return birthDate >= startValidity && birthDate <= endValidity;
          }
          // Altrimenti filtra per età compiuta
          else {
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            return age >= selectedAgeGroup.etaMinima && age <= selectedAgeGroup.etaMassima;
          }
        });
      }
    }

    setFilteredAthletes(result);
  }, [filters, athletes, ageGroups, user]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (athlete = null) => {
    setIsEditMode(!!athlete);
    setSelectedAthlete(athlete);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleOpenInfoModal = (athlete) => {
    setSelectedAthlete(athlete);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
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
    <div className="page-container">
      <PageHeader
        icon={FaUsers}
        title="Gestione Atleti"
      />

      {/* Contenuto della pagina */}
      <div className="page-content">

        <div className="page-card">
          {/* <div className="page-card-header">
            <Typography variant="h6" className="page-card-title">
              Filtri
            </Typography>
          </div> */}
          <div className="page-card-body">
            <Box sx={{ mb: 2 }} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <TextField
                name="name"
                label="Filtra per Nome/Cognome"
                variant="outlined"
                onChange={handleFilterChange}
              />
              <Button
                icon={Add}
                onClick={() => handleOpenModal()}
              >
                Aggiungi Atleta
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <AuthComponent requiredRoles={['admin', 'superAdmin']}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
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
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
                      <InputLabel>Filtra per Gruppo Età</InputLabel>
                      <Select
                        name="ageGroup"
                        label="Filtra per Gruppo Età"
                        value={filters.ageGroup}
                        onChange={handleFilterChange}
                      >
                        <MenuItem value="">
                          <em>Tutti</em>
                        </MenuItem>
                        {ageGroups.map((group) => (
                          <MenuItem key={group.id} value={group.id}>
                            {group.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </AuthComponent>
              </Grid>
            </Box>

          </div>
        </div>

        <div className="page-card">
          {/* <div className="page-card-header">
            <h2 className="page-card-title">Titolo Card</h2>
          </div> */}
          <div className="page-card-body">

            <AthletesTable
              athletes={filteredAthletes.map(athlete => ({
                ...athlete,
                onUploadCertificato: handleOpenCertificatoModal,
                onDownloadCertificato: handleOpenCertificatoModal
              }))}
              onInfo={handleOpenInfoModal}
              onEdit={handleOpenModal}
              onDelete={handleDeleteAthlete}
            />

            {isModalOpen && (
              <AthleteModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveAthlete}
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
          </div>
        </div>


      </div>
    </div>
  );
};

export default Athletes;