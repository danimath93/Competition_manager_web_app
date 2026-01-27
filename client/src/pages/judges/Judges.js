import React, { useState, useEffect } from 'react';
import {
  Box,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { FaGavel } from 'react-icons/fa';
import { loadAllJudges, createJudge, updateJudge, deleteJudge } from '../../api/judges';
import JudgesTable from '../../components/JudgesTable';
import JudgeModal from '../../components/JudgeModal';
import PageHeader from '../../components/PageHeader';
import SearchTextField from '../../components/SearchTextField';
import ConfirmActionModal from '../../components/common/ConfirmActionModal';
import { Button } from '../../components/common';
import '../styles/CommonPageStyles.css';

const Judges = () => {
  const [judges, setJudges] = useState([]);
  const [filteredJudges, setFilteredJudges] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    experience: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [isDeleteJudgeConfirmModalOpen, setIsDeleteJudgeConfirmModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const judgesData = await loadAllJudges();
        setJudges(judgesData);
        setFilteredJudges(judgesData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

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

    setFilteredJudges(result);
  }, [filters, judges]);

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

  const handleJudgeDeleteConfirm = (judge) => {
    setSelectedJudge(judge);
    setIsDeleteJudgeConfirmModalOpen(true);
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
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PageHeader
        icon={FaGavel}
        title="Gestione Giudici"
      />

      {/* Contenuto della pagina */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="page-card" style={{ flexShrink: 0 }}>
          <div className="page-card-body">
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <SearchTextField
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Filtra per Nome/Cognome"
                sx={{
                  maxWidth: "800px",
                  '& .MuiOutlinedInput-root': {
                    height: '60px',
                  }
                }}
              />
              <Button
                icon={Add}
                size='s'
                onClick={() => handleOpenModal()}
              >
                Aggiungi Giudice
              </Button>
            </Box>
          </div>
        </div>

        <div className="page-card" style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="page-card-body" style={{ flex: 1, overflow: 'auto' }}>

          <JudgesTable
            judges={filteredJudges}
            onEdit={handleOpenModal}
            onDelete={handleJudgeDeleteConfirm}
          />

          {isModalOpen && (
            <JudgeModal
              open={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSaveJudge}
              onDelete={handleDeleteJudge}
              isEditMode={isEditMode}
              judge={selectedJudge}
            />
          )}

          {isDeleteJudgeConfirmModalOpen && (
            <ConfirmActionModal
              open={isDeleteJudgeConfirmModalOpen}
              onClose={() => setIsDeleteJudgeConfirmModalOpen(false)}
              title="Conferma Eliminazione"
              message="Sei sicuro di voler eliminare il giudice selezionato?"
              primaryButton={{
                text: 'Elimina',
                onClick: async () => { await handleDeleteJudge(selectedJudge); setIsDeleteJudgeConfirmModalOpen(false); },
              }}
              secondaryButton={{
                text: 'Annulla',
                onClick: () => setIsDeleteJudgeConfirmModalOpen(false),
              }}
            />
          )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Judges;