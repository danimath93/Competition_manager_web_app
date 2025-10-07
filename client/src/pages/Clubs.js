import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { loadAllClubs, createClub, updateClub, deleteClub } from '../api/clubs';
import ClubsTable from '../components/ClubsTable';
import ClubModal from '../components/ClubModal';
import ClubInfoModal from '../components/ClubInfoModal';

const Clubs = () => {
  const { user } = useAuth();
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    referente: '',
    citta: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsData = await loadAllClubs();
        setClubs(clubsData);
        setFilteredClubs(clubsData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let result = clubs;

    if (filters.name) {
      result = result.filter(
        (club) =>
          club.nome.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.referente) {
      result = result.filter((club) =>
        club.referente.toLowerCase().includes(filters.referente.toLowerCase())
      );
    }

    if (filters.citta) {
      result = result.filter((club) =>
        club.citta.toLowerCase().includes(filters.citta.toLowerCase())
      );
    }

    setFilteredClubs(result);
  }, [filters, clubs, user]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (club = null) => {
    setIsEditMode(!!club);
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClub(null);
  };

  const handleOpenInfoModal = (club) => {
    setSelectedClub(club);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedClub(null);
  };

  const handleSaveClub = async (clubData) => {
    try {
      if (isEditMode) {
        await updateClub(clubData.id, clubData);
      } else {
        await createClub(clubData);
      }
      const clubsData = await loadAllClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error("Errore nel salvataggio del club:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteClub = async (clubId) => {
    try {
      await deleteClub(clubId);
      const clubsData = await loadAllClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error("Errore nell'eliminazione del club:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestione Club
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="name"
              label="Filtra per Nome"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="referente"
              label="Filtra per Referente"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="citta"
              label="Filtra per Città"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Aggiungi Club
        </Button>
      </Box>

      <ClubsTable
        clubs={filteredClubs || []}
        onInfo={handleOpenInfoModal}
        onEdit={handleOpenModal}
        onDelete={handleDeleteClub}
      />

      {isModalOpen && (
        <ClubModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSaveClub}
          isEditMode={isEditMode}
          club={selectedClub}
          user={user}
        />
      )}

      {isInfoModalOpen && (
        <ClubInfoModal
          open={isInfoModalOpen}
          onClose={handleCloseInfoModal}
          club={selectedClub}
        />
      )}
    </Container>
  );
};

export default Clubs;