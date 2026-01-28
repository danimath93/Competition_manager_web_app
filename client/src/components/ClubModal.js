import React from 'react';
import {
  TextField,
  Button,
  Alert,
  Box,
  Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import DrawerModal from './common/DrawerModal';
import ConfirmActionModal from './common/ConfirmActionModal';
import AuthComponent from './AuthComponent';
import './common/DrawerModal.css';

const ClubModal = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  club,
  isEditMode,
}) => {
  const [formData, setFormData] = React.useState({});
  const [displayError, setDisplayError] = React.useState('');
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (isEditMode && club) {
      setFormData({
        denominazione: club?.denominazione,
        codiceFiscale: club?.codiceFiscale,
        partitaIva: club?.partitaIva,
        indirizzo: club?.indirizzo,
        legaleRappresentante: club?.legaleRappresentante,
        direttoreTecnico: club?.direttoreTecnico,
        recapitoTelefonico: club?.recapitoTelefonico,
        email: club?.email,
        tesseramento: club?.tesseramento,
        abbreviazione: club?.abbreviazione,
      });

    } else {
      setFormData({
        denominazione: '',
        codiceFiscale: '',
        partitaIva: '',
        indirizzo: '',
        legaleRappresentante: '',
        direttoreTecnico: '',
        recapitoTelefonico: '',
        email: '',
        tesseramento: '',
        abbreviazione: '',
      });
    }
  }, [open, isEditMode, club]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value === '' ? null : e.target.value });
  };

  const handleTesseramentoChange = (value) => {
    setFormData({ ...formData, tesseramento: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setDisplayError('');
      // Passa anche l'id se in edit mode
      if (isEditMode && club && club.id) {
        await onSubmit({ ...formData, id: club.id });
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      setDisplayError(error.message || 'Errore durante la modifica del club.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo club?')) {
      try {
        if (onDelete) {
          await onDelete(club.id);
          onClose();
        }
      } catch (error) {
        setDisplayError(error.message || "Errore nell'eliminazione del club");
      }
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Club"
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {isEditMode && onDelete && (
              <Button
                onClick={() => setConfirmDeleteModalOpen(true)}
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Elimina club
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
          <TextField
            name="denominazione"
            label="Denominazione"
            value={formData.denominazione || ''}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />

          <div className="drawer-fields-row-2">
            <TextField
              name="codiceFiscale"
              label="Codice Fiscale"
              value={formData.codiceFiscale || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
            <TextField
              name="partitaIva"
              label="Partita IVA"
              value={formData.partitaIva || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </div>

          <TextField
            name="indirizzo"
            label="Indirizzo"
            value={formData.indirizzo || ''}
            onChange={handleChange}
            fullWidth
            size="small"
          />

          <div className="drawer-fields-row-2">
            <TextField
              name="recapitoTelefonico"
              label="Recapito Telefonico"
              value={formData.recapitoTelefonico || ''}
              onChange={handleChange}
              fullWidth
              size="small"
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Informazioni legali */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Informazioni legali e direzione</h3>
        <div className="drawer-section-content">
          <div className="drawer-fields-row-2">
            <TextField
              name="legaleRappresentante"
              label="Legale Rappresentante"
              value={formData.legaleRappresentante || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
            <TextField
              name="direttoreTecnico"
              label="Direttore Tecnico"
              value={formData.direttoreTecnico || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Informazioni aggiuntive */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Informazioni aggiuntive</h3>
        <div className="drawer-section-content">
          <Autocomplete
            id="tesseramento-select"
            value={formData.tesseramento || ''}
            getOptionLabel={(tesseramento) => tesseramento}
            onChange={(event, value) => handleTesseramentoChange(value)}
            isOptionEqualToValue={(option, value) => option === value}
            options={['FIWUK', 'ASI', 'Altro Ente']}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Affiliazione"
                size="small"
                required
              />
            )}
          />
          <AuthComponent requiredRoles={['admin', 'superAdmin']}>
            <TextField
              name="abbreviazione"
              label="Abbreviazione"
              value={formData.abbreviazione || ''}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </AuthComponent>
        </div>
      </div>

      {displayError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {displayError}
        </Alert>
      )}

      {confirmDeleteModalOpen && (
        <ConfirmActionModal
          open={confirmDeleteModalOpen}
          onClose={() => setConfirmDeleteModalOpen(false)}
          title="Conferma Eliminazione"
          message="Sei sicuro di voler eliminare questo club? Questa azione non può essere annullata."
          primaryButton={{
            text: 'Elimina',
            onClick: async () => { await handleDelete(); },
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setConfirmDeleteModalOpen(false),
          }}
          loading={false}
        />
      )}
    </DrawerModal>
  );
};

export default ClubModal;
