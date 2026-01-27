import React from 'react';
import {
  TextField,
  Button,
  Autocomplete,
  Alert,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { loadAllClubs } from '../api/clubs';
import { loadAthleteTypes } from '../api/config';
import AuthComponent from './AuthComponent';
import DrawerModal from './common/DrawerModal';
import ConfirmActionModal from './common/ConfirmActionModal';
import './common/DrawerModal.css';

const JudgeModal = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  judge,
  isEditMode,
}) => {
  const [formData, setFormData] = React.useState({});
  const [judgeExperiences, setJudgeExperiences] = React.useState([]);
  const [isDeleteJudgeConfirmModalOpen, setIsDeleteJudgeConfirmModalOpen] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (isEditMode && judge) {
      setFormData(judge);
    } else {
      setFormData({
        nome: '',
        cognome: '',
        dataNascita: '',
        livelloEsperienza: '',
        regione: '',
      });
    }
  }, [open, isEditMode, judge]);
 
  React.useEffect(() => {
    const fetchJudgeExperiences = async () => {
      try {
        // TODO: aggiungere API per richiedere livelli di esperienza dei giudici
      } catch (error) {
        console.error('Errore nel caricamento dei livelli di esperienza:', error);
      }
    };
    fetchJudgeExperiences();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleJudgeExperienceChange = (event, newValue) => {
    setFormData({ ...formData, esperienza: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || "Errore nel salvataggio del giudice");
    }
  };

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(judge.id);
        onClose();
      }
    } catch (error) {
      setError(error.message || "Errore nell'eliminazione del giudice");
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Modifica Giudice' : 'Aggiungi Giudice'}
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {isEditMode && onDelete && (
              <Button
                onClick={() => setIsDeleteJudgeConfirmModalOpen(true)}
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Elimina profilo
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
            >
              {isEditMode ? 'Salva Modifiche' : 'Aggiungi'}
            </Button>
          </Box>
        </Box>
      }
    >
      {/* Informazioni generali */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Informazioni generali</h3>
        <div className="drawer-section-content">
          <div className="drawer-fields-row-2">
            <TextField
              name="nome"
              label="Nome"
              value={formData.nome || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
            <TextField
              name="cognome"
              label="Cognome"
              value={formData.cognome || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </div>

          <div className="drawer-fields-row-2">
            <TextField
              name="dataNascita"
              label="Data di Nascita"
              type="date"
              value={formData.dataNascita || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              name="regione"
              label="Regione"
              value={formData.regione || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />

          </div>
        </div>
      </div>

      {/* Informazioni esperienza */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Info: Esperienza</h3>
        <div className="drawer-section-content">
          <div className="drawer-fields-row-2">
            <Autocomplete
              id="exp-select"
              value={formData.esperienza || null}
              getOptionLabel={(option) => option.nome || ''}
              onChange={handleJudgeExperienceChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Livello Giudice"
                  variant="outlined"
                  required
                  size="small"
                />
              )}
              options={judgeExperiences}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isDeleteJudgeConfirmModalOpen && (
        <ConfirmActionModal
          open={isDeleteJudgeConfirmModalOpen}
          onClose={() => setIsDeleteJudgeConfirmModalOpen(false)}
          title="Conferma Eliminazione"
          message="Sei sicuro di voler eliminare il giudice selezionato?"
          primaryButton={{
            text: 'Elimina',
            onClick: async () => { await handleDelete(); setIsDeleteJudgeConfirmModalOpen(false); },
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setIsDeleteJudgeConfirmModalOpen(false),
          }}
        />
      )}

    </DrawerModal>
  );
};

export default JudgeModal;
