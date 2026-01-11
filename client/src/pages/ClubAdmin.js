import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { FaUniversity } from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import { loadAllClubs, createClub, updateClub, deleteClub } from '../api/clubs';
import ClubsTable from '../components/ClubsTable';
import ClubModal from '../components/ClubModal';
import PageHeader from '../components/PageHeader';
import Button from '../components/common/Button';
import ConfirmActionModal from '../components/common/ConfirmActionModal';

const ClubAdmin = () => {
  const { user } = useAuth();
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [filters, setFilters] = useState({
    denominazione: '',
    codiceFiscale: '',
    rappresentanti: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

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
    if (filters.rappresentanti) {
      result = result.filter((club) =>
        club.legaleRappresentante?.toLowerCase().includes(filters.rappresentanti.toLowerCase()) ||
        club.direttoreTecnico?.toLowerCase().includes(filters.rappresentanti.toLowerCase())
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

  const handleSaveClub = async (clubData) => {
    try {
      if (isEditMode) {
        await updateClub(clubData.id, clubData);
      } else {
        await createClub(clubData);
      }
      const clubsData = await loadAllClubs();
      setClubs(clubsData);
      handleCloseModal();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteClubConfirm = () => {
    setConfirmDeleteModalOpen(true);
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
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PageHeader
        title="Gestione Club" 
        icon={FaUniversity}
      />

      {/* Contenuto della pagina */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="page-card" style={{ flexShrink: 0 }}>
          <div className="page-card-body">
            <Box sx={{ mb: 2 }} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="rappresentanti"
                    label="Filtra per Rappr. o Dir. Tecnico"
                    variant="outlined"
                    fullWidth
                    onChange={handleFilterChange}
                  />
                </Grid>
              </Grid>
              <Button
                icon={Add}
                onClick={() => handleOpenModal()}
              >
                Aggiungi Club
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
            </Box>
          </div>
        </div>

        <div className="page-card" style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="page-card-body" style={{ flex: 1, overflow: 'auto' }}>
            <ClubsTable
              clubs={filteredClubs || []}
              onEdit={handleOpenModal}
              onDelete={handleDeleteClubConfirm}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ClubModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSaveClub}
          onDelete={handleDeleteClub}
          isEditMode={isEditMode}
          club={selectedClub}
          user={user}
        />
      )}

      {confirmDeleteModalOpen && (
        <ConfirmActionModal
          open={confirmDeleteModalOpen}
          onClose={() => setConfirmDeleteModalOpen(false)}
          title="Conferma Eliminazione"
          subtitle={selectedClub?.denominazione}
          message="Sei sicuro di voler eliminare questo club? Questa azione non può essere annullata."
          primaryButton={{
            text: 'Elimina',
            onClick: async () => { await handleDeleteClub(selectedClub.id); setConfirmDeleteModalOpen(false); },
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setConfirmDeleteModalOpen(false),
          }}
        />
      )}
    </div>
  );
};

export default ClubAdmin;