import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
    loadAllCompetitions, 
    createCompetition,
    updateCompetition,
    deleteCompetition,
    getCompetitionDetails 
} from '../api/competitions';
import CompetitionCard from '../components/CompetitionCard';
import CompetitionModal from '../components/CompetitionModal';
import CompetitionDetailsModal from '../components/CompetitionDetailsModal';
import CompetitionOrganizerSelectorModal from '../components/CompetitionOrganizerSelectorModal';

const Competitions = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [competitions, setCompetitions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editClubOrganizerModalOpen, setEditClubOrganizerModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [competitionDetails, setCompetitionDetails] = useState(null);

  const fetchCompetitions = async () => {
    try {
      const data = await loadAllCompetitions();
      // Ordina le competizioni per data di inizio, dalla più recente alla più vecchia
      const sortedData = data.sort((a, b) => new Date(b.dataInizio) - new Date(a.dataInizio));
      setCompetitions(sortedData);
    } catch (error) {
      console.error("Errore nel caricamento delle competizioni:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompetitions();
    }
  }, [user]);

  const handleOpenModal = (competition = null) => {
    setIsEditMode(!!competition);
    setSelectedCompetition(competition);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompetition(null);
  };

  const handleOpenDetailsModal = async (competition) => {
    try {
        const details = await getCompetitionDetails(competition.id);
        setCompetitionDetails(details);
        setIsDetailsModalOpen(true);
    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
    }
  };

  const handleOpenEditClubOrganizerModal = async (competition) => {
    setSelectedCompetition(competition);
    setEditClubOrganizerModalOpen(true);
  };

  const handleClubOrganizerSelected = (organizerId) => {
    if (organizerId && selectedCompetition?.id) {
      const updatedCompetition = {
        ...selectedCompetition,
        organizzatoreClubId: organizerId,
      };
      updateCompetition(selectedCompetition.id, updatedCompetition);
      setSelectedCompetition(null);
      setEditClubOrganizerModalOpen(false);
      fetchCompetitions();
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setCompetitionDetails(null);
  };

  const handleSaveModifyCompetition = async (competitionData) => {
    if (competitionData.id) {
      await updateCompetition(competitionData.id, competitionData);
    } else {
        await createCompetition(competitionData);
    }
    handleCloseModal();
    fetchCompetitions(); 
  };

  const handleDeleteCompetition = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa competizione?')) {
      try {
        await deleteCompetition(id);
        fetchCompetitions();
      } catch (error) {
        console.error("Errore nell'eliminazione della competizione:", error);
      }
    }
  };

  const handleRegister = (competitionId) => {
    navigate(`/competitions/${competitionId}/register`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {t('competitions')}
      </Typography>

      {user && (user.permissions === 'admin' || user.permissions === 'superAdmin') && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
          >
            Aggiungi Competizione
          </Button>
        </Box>
      )}

      <div>
        {competitions.map((comp) => (
          <CompetitionCard
            key={comp.id}
            competition={comp}
            onRegister={handleRegister}
            onEdit={handleOpenModal}
            onEditClubOrganizer={() => handleOpenEditClubOrganizerModal(comp)}
            onDelete={handleDeleteCompetition}
            onDetails={handleOpenDetailsModal}
          />
        ))}
      </div>

      {isModalOpen && (
        <CompetitionModal
            open={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSaveModifyCompetition}
            isEditMode={isEditMode}
            competition={selectedCompetition}
        />
      )}

      {isDetailsModalOpen && (
        <CompetitionDetailsModal
            open={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            competitionDetails={competitionDetails}
        />
      )}

      {editClubOrganizerModalOpen && (
        <CompetitionOrganizerSelectorModal
            open={editClubOrganizerModalOpen}
            onClose={() => setEditClubOrganizerModalOpen(false)}
            onSubmit={handleClubOrganizerSelected}
            organizerId={selectedCompetition?.organizzatoreClubId}
            competition={selectedCompetition} 
        />
      )}
    </Container>
  );
};


export default Competitions;
