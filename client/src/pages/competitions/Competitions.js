import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import { FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  loadAllCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionDetails
} from '../../api/competitions';
import CompetitionCard from '../../components/CompetitionCard';
import CompetitionDetailsModal from '../../components/CompetitionDetailsModal';
import CompetitionOrganizerSelectorModal from '../../components/CompetitionOrganizerSelectorModal';
import CompetitionDocumentsModal from '../../components/CompetitionDocumentsModal';
import AuthComponent from '../../components/AuthComponent';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/common/Button';

const Competitions = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [competitions, setCompetitions] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editClubOrganizerModalOpen, setEditClubOrganizerModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
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

  const reloadSelectedCompetitionData = async () => {
    if (selectedCompetition?.id) {
      try {
        const updatedCompetition = await getCompetitionDetails(selectedCompetition.id);
        setSelectedCompetition(updatedCompetition);

        competitions.forEach((comp, index) => {
          if (comp.id === updatedCompetition.id) {
            const updatedCompetitions = [...competitions];
            updatedCompetitions[index] = updatedCompetition;
            setCompetitions(updatedCompetitions);
          }
        });
      } catch (error) {
        console.error("Errore nel ricaricamento dei dati della competizione:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompetitions();
    }
  }, [user]);

  const handleOpenModal = (competition = null) => {
    if (competition) {
      navigate(`/competitions/edit/${competition.id}`);
    } else {
      navigate('/competitions/new');
    }
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
      reloadSelectedCompetitionData();
      setSelectedCompetition(null);
      setEditClubOrganizerModalOpen(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setCompetitionDetails(null);
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

  const handleOpenSummaryModal = (competitionId) => {
    navigate(`/competitions/${competitionId}/summary`);
  };

  const handleOpenCategories = (competitionId) => {
    navigate(`/competitions/${competitionId}/categories`);
  };

  const handleOpenDocumentsModal = (competition) => {
    setSelectedCompetition(competition);
    setIsDocumentsModalOpen(true);
  };

  const handleCloseDocumentsModal = () => {
    reloadSelectedCompetitionData();
    setIsDocumentsModalOpen(false);
    setSelectedCompetition(null);
  };

  const handleDocumentLoadedChanged = () => {
    reloadSelectedCompetitionData();
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title={t('competitions')}
      />

      {/* Contenuto della pagina */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 400 }}>
        {competitions.map((comp) => (
          <CompetitionCard
            key={comp.id}
            competition={comp}
            onRegister={handleRegister}
            onEdit={handleOpenModal}
            onEditClubOrganizer={() => handleOpenEditClubOrganizerModal(comp)}
            onDelete={handleDeleteCompetition}
            onDetails={handleOpenDetailsModal}
            onSummary={handleOpenSummaryModal}
            onDocuments={handleOpenDocumentsModal}
            onCategories={handleOpenCategories}
            userClubId={user?.clubId}
            userPermissions={user?.permissions}
          />
        ))}

        <AuthComponent requiredRoles={['admin', 'superAdmin']}>
          <Box sx={{ mt: 2, ml: 'auto', display: 'flex', justifyContent: 'center' }}>
            <Button
              icon={Add}
              onClick={() => handleOpenModal()}
            >
              Aggiungi Competizione
            </Button>
          </Box>
        </AuthComponent>
      </div>


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

      {isDocumentsModalOpen && (
        <CompetitionDocumentsModal
          open={isDocumentsModalOpen}
          onClose={handleCloseDocumentsModal}
          onDocumentChange={handleDocumentLoadedChanged}
          competition={selectedCompetition}
          userClubId={user?.clubId}
          userPermissions={user?.permissions}
        />
      )}
    </div>
  );
};


export default Competitions;
