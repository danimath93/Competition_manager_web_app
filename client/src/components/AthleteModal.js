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

const AthleteModal = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  athlete,
  isEditMode,
  userClubId,
}) => {
  const [formData, setFormData] = React.useState({});
  const [clubs, setClubs] = React.useState([]);
  const [clubName, setClubName] = React.useState(athlete?.club?.denominazione || '');
  const [clubNames, setClubNames] = React.useState([]);
  const [athleteTypes, setAthleteTypes] = React.useState([]);
  const [isDeleteAthleteConfirmModalOpen, setIsDeleteAthleteConfirmModalOpen] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (isEditMode && athlete) {
      setFormData(athlete);
    } else {
      let club = null;
      if (userClubId) {
        club = clubs.find((c) => c.id === userClubId) || null;
        setClubName(club?.denominazione || '');
      }

      setFormData({
        nome: '',
        cognome: '',
        dataNascita: '',
        tipoAtleta: null,
        tipoAtletaId: null,
        sesso: '',
        codiceFiscale: null,
        club: club,
        clubId: club ? club.id : null,
        numeroTessera: null,
        scadenzaCertificato: null,
      });
    }
  }, [open, isEditMode, athlete, clubs, userClubId]);

  React.useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubsData = await loadAllClubs();
        const clubNames = clubsData.map((club) => club.denominazione);
        setClubs(clubsData);
        setClubNames(clubNames);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setError('Errore nel caricamento dei dati');
      }
    };

    const fetchAthleteTypes = async () => {
      try {
        const athleteTypesData = await loadAthleteTypes();
        setAthleteTypes(athleteTypesData);
      } catch (error) {
        console.error('Errore nel caricamento dei tipi atleta:', error);
        setError('Errore nel caricamento dei tipi atleta');
      }
    };

    fetchClubs();
    fetchAthleteTypes();
  }, []);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === 'numeroTessera') {
      // Accetta solo numeri e massimo 8 caratteri
      if (/^\d{0,8}$/.test(value)) {
        setFormData({ ...formData, [name]: value === '' ? null : value });
      }
    } else {
      setFormData({ ...formData, [name]: value === '' ? null : value });
    }
  };

  const handleClubSelectChange = (value) => {
    setClubName(value);
    const selectedClub = clubs.find((club) => club.denominazione === value);
    setFormData({ ...formData, clubId: selectedClub?.id || null, club: selectedClub || null });
  }

  const handleAthleteTypeChange = (event, value) => {
    setFormData({ ...formData, tipoAtletaId: value ? value.id : null, tipoAtleta: value || null });
  }

  const handleGenderChange = (value) => {
    setFormData({ ...formData, sesso: value || '' });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || "Errore nel salvataggio dell'atleta");
    }
  };

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(athlete.id);
        onClose();
      }
    } catch (error) {
      setError(error.message || "Errore nell'eliminazione dell'atleta");
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Atleta"
      badge={formData.eta || athlete?.eta}
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {isEditMode && onDelete && (
              <Button
                onClick={() => setIsDeleteAthleteConfirmModalOpen(true)}
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

            <Autocomplete
              id="gender-select"
              value={formData.sesso || ''}
              getOptionLabel={(sesso) => sesso}
              onChange={(event, value) => handleGenderChange(value)}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sesso"
                  size="small"
                  required
                />
              )}
              options={['M', 'F']}
            />
          </div>
          <TextField
            name="codiceFiscale"
            label="Codice Fiscale"
            value={formData.codiceFiscale || ''}
            onChange={handleChange}
            required
            fullWidth
            size="small"
          />
        </div>
      </div>

      {/* Informazioni federazione */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Info: Viet Vo Dao Italia</h3>
        <div className="drawer-section-content">
          <div className="drawer-fields-row-2">
            <TextField
              name="numeroTessera"
              label="Numero Tessera"
              value={formData.numeroTessera || ''}
              onChange={handleChange}
              required
              fullWidth
              size="small"
            />
            <Autocomplete
              id="grade-select"
              value={formData.tipoAtleta || null}
              getOptionLabel={(option) => option.nome || ''}
              onChange={handleAthleteTypeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Livello Atleta"
                  variant="outlined"
                  required
                  size="small"
                />
              )}
              options={athleteTypes}
            />
          </div>

          <AuthComponent requiredRoles={['admin', 'superAdmin']}>
            <Autocomplete
              id="club-select"
              value={clubName}
              groupBy={(club) => club.charAt(0).toUpperCase()}
              getOptionLabel={(club) => club}
              onChange={(event, value) => handleClubSelectChange(value)}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Club"
                  size="small"
                  required
                />
              )}
              options={clubNames ? [...clubNames].sort((a, b) => a.localeCompare(b)) : []}
            />
          </AuthComponent>

          <AuthComponent requiredRoles={['club']}>
            <TextField
              id="club-select-readonly"
              label="Club"
              value={clubName}
              fullWidth
              required
              size="small"
              InputProps={{
                readOnly: true,
              }}
              disabled={false}
            />
          </AuthComponent>
          
                  </div>
      </div>

      {/* Dati aggiuntivi nascosti inizialmente */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Info: Tesseramento assicurativo</h3>
        <div className="drawer-section-content">

          <TextField
            name="scadenzaCertificato"
            label="Scadenza Certificato Medico"
            type="date"
            value={formData.scadenzaCertificato || ''}
            onChange={handleChange}
            fullWidth
            required
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isDeleteAthleteConfirmModalOpen && (
        <ConfirmActionModal
          open={isDeleteAthleteConfirmModalOpen}
          onClose={() => setIsDeleteAthleteConfirmModalOpen(false)}
          title="Conferma Eliminazione"
          message="Sei sicuro di voler eliminare l'atleta selezionato?"
          primaryButton={{
            text: 'Elimina',
            onClick: async () => { await handleDelete(); setIsDeleteAthleteConfirmModalOpen(false); },
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setIsDeleteAthleteConfirmModalOpen(false),
          }}
        />
      )}

    </DrawerModal>
  );
};

export default AthleteModal;
