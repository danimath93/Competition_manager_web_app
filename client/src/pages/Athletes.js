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
import { loadAthleteTypes } from '../api/config';
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
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    club: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && (user.permissions === 'admin' || user.permissions === 'superAdmin')) {
          const athletesData = await loadAllAthletes();
          setAthletes(athletesData);
          setFilteredAthletes(athletesData);
        } else {
          const athletesData = await loadAthletesByClub(user.clubId);
          setAthletes(athletesData);
          setFilteredAthletes(athletesData);
        }

        const athleteTypesData = await loadAthleteTypes();
        setAthleteTypes(athleteTypesData);
        
        if (user && (user.permissions === 'admin' || user.permissions === 'superAdmin')) {
          const clubsData = await loadAllClubs();
          setClubs(clubsData);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
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

    setFilteredAthletes(result);
  }, [filters, athletes, user]);

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
      const athletesData = await loadAllAthletes();
      setAthletes(athletesData);
      handleCloseModal();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteAthlete = async (athleteId) => {
    try {
      await deleteAthlete(athleteId);
      const athletesData = await loadAllAthletes();
      setAthletes(athletesData);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'atleta:", error);
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
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200}}>
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