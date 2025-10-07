import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
  //FormControl,
  //InputLabel,
  //Select,
  //MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { loadAllJudges, createJudge, updateJudge, deleteJudge } from '../api/judges';
import JudgesTable from '../components/JudgesTable';
import JudgeModal from '../components/JudgeModal';
import JudgeInfoModal from '../components/JudgeInfoModal';

const Judges = () => {
  const { user } = useAuth();
  const [judges, setJudges] = useState([]);
  const [filteredJudges, setFilteredJudges] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    experience: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const judgesData = await loadAllJudges();
        setJudges(judgesData);
        setFilteredJudges(judgesData);
/* dipende se i giudici li mette l'admin oppure li inserice il club 
        if (user && user.isAdmin) {
          const clubsData = await loadAllClubs();
          setClubs(clubsData);
        }*/
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let result = judges;

    if (filters.name) {
      result = result.filter(
        (judge) =>
          `${judge.nome} ${judge.cognome}`
            .toLowerCase()
            .includes(filters.name.toLowerCase())
      );
    }

    if (filters.experience) {
      result = result.filter((judge) =>
        judge.experience.toLowerCase().includes(filters.experience.toLowerCase())
      );
    }
/* da capire come sopra
    if (user && user.isAdmin && filters.club) {
      result = result.filter((judge) => judge.club_id === filters.club);
    } else if (user && !user.isAdmin) {
      result = result.filter((judge) => judge.club_id === user.club_id);
    }*/


    setFilteredJudges(result);
  }, [filters, judges, user]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (judge = null) => {
    setIsEditMode(!!judge);
    setSelectedJudge(judge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJudge(null);
  };

  const handleOpenInfoModal = (judge) => {
    setSelectedJudge(judge);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedJudge(null);
  };

  const handleSaveJudge = async (judgeData) => {
    try {
      if (isEditMode) {
        await updateJudge(judgeData.id, judgeData);
      } else {
        await createJudge(judgeData);
      }
      const judgesData = await loadAllJudges();
      setJudges(judgesData);
    } catch (error) {
      console.error("Errore nel salvataggio del giudice:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteJudge = async (judgeId) => {
    try {
      await deleteJudge(judgeId);
      const judgesData = await loadAllJudges();
      setJudges(judgesData);
    } catch (error) {
      console.error("Errore nell'eliminazione del giudice:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestione Giudici
      </Typography>
      {/* credo da capire come sopra
      {user && !user.permissions && (
        <Typography variant="h6" gutterBottom>
          Club: {user.club_name}
        </Typography>
      )} */}

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
            <TextField
              name="experience"
              label="Filtra per Esperienza"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
            />
          </Grid>
          {/*
          {user && user.isAdmin && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Club</InputLabel>
                <Select
                  name="club"
                  label="Club"
                  value={filters.club}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">
                    <em>Tutti</em>
                  </MenuItem>
                  {clubs.map((club) => (
                    <MenuItem key={club.id} value={club.id}>
                      {club.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )} */}
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Aggiungi Giudice
        </Button>
      </Box>

      <JudgesTable
        judges={filteredJudges}
        onInfo={handleOpenInfoModal}
        onEdit={handleOpenModal}
        onDelete={handleDeleteJudge}
      />

      {isModalOpen && (
        <JudgeModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSaveJudge}
          isEditMode={isEditMode}
          judge={selectedJudge}
          user={user}
        />
      )}

      {isInfoModalOpen && (
        <JudgeInfoModal
          open={isInfoModalOpen}
          onClose={handleCloseInfoModal}
          judge={selectedJudge}
        />
      )}
    </Container>
  );
};

export default Judges;