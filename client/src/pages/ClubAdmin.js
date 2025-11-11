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

const ClubAdmin = () => {
  const { user } = useAuth();
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [filters, setFilters] = useState({
    denominazione: '',
    codiceFiscale: '',
    partitaIva: '',
    legaleRappresentante: '',
    direttoreTecnico: '',
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

    if (filters.denominazione) {
      result = result.filter(
        (club) =>
          club.denominazione?.toLowerCase().includes(filters.denominazione.toLowerCase())
      );
    }
    if (filters.codiceFiscale) {
      result = result.filter((club) =>
        club.codiceFiscale?.toLowerCase().includes(filters.codiceFiscale.toLowerCase())
      );
    }
    if (filters.partitaIva) {
      result = result.filter((club) =>
        club.partitaIva?.toLowerCase().includes(filters.partitaIva.toLowerCase())
      );
    }
    if (filters.legaleRappresentante) {
      result = result.filter((club) =>
        club.legaleRappresentante?.toLowerCase().includes(filters.legaleRappresentante.toLowerCase())
      );
    }
    if (filters.direttoreTecnico) {
      result = result.filter((club) =>
        club.direttoreTecnico?.toLowerCase().includes(filters.direttoreTecnico.toLowerCase())
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
              name="denominazione"
              label="Filtra per Denominazione"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="codiceFiscale"
              label="Filtra per Codice Fiscale"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="partitaIva"
              label="Filtra per Partita IVA"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="legaleRappresentante"
              label="Filtra per Legale Rappresentante"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="direttoreTecnico"
              label="Filtra per Direttore Tecnico"
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

export default ClubAdmin;