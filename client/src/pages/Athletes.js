import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { loadAllAthletes, createAthlete, updateAthlete, deleteAthlete, loadAthletesByClub } from '../api/athletes';
import { loadAllClubs } from '../api/clubs';
import { loadAthleteTypes, loadAgeGroups } from '../api/config';
import AthletesTable from '../components/AthletesTable';
import AthleteModal from '../components/AthleteModal';
import AthleteInfoModal from '../components/AthleteInfoModal';
import AuthComponent from '../components/AuthComponent';

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
    insurance: '',
    gender: '',
    ageGroup: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const insurances = ['N/A', 'ASI', 'FIWUK'];

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

    if (filters.insurance) {
      if (filters.insurance === 'N/A') {
        result = result.filter((athlete) => !athlete.tesseramento);
      } else {
        result = result.filter((athlete) => athlete.tesseramento === filters.insurance);
      }
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
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestione Atleti
      </Typography>
      {user && !user.permissions && (
        <Typography variant="h6" gutterBottom>
          Club: {user.club_name}
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="name"
              label="Filtra per Nome/Cognome"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Filtra per Tipo Atleta</InputLabel>
              <Select
                name="type"
                label="Filtra per Tipo Atleta"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>Tutti</em>
                </MenuItem>
                {athleteTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Filtra per Tesseramento</InputLabel>
              <Select
                name="insurance"
                label="Filtra per Tesseramento"
                value={filters.insurance}
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>Tutti</em>
                </MenuItem>
                {insurances.map((insurance) => (
                  <MenuItem key={insurance} value={insurance}>
                    {insurance}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Filtra per Sesso</InputLabel>
              <Select
                name="gender"
                label="Filtra per Sesso"
                value={filters.gender}
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>Tutti</em>
                </MenuItem>
                <MenuItem value="M">Maschio</MenuItem>
                <MenuItem value="F">Femmina</MenuItem>
              </Select>
            </FormControl>
          </Grid>
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

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Aggiungi Atleta
        </Button>
      </Box>

      <AthletesTable
        athletes={filteredAthletes}
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

      {isInfoModalOpen && (
        <AthleteInfoModal
          open={isInfoModalOpen}
          onClose={handleCloseInfoModal}
          athlete={selectedAthlete}
        />
      )}
    </Container>
  );
};

export default Athletes;