import React, { use } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Alert,
} from '@mui/material';
import { loadAllClubs } from '../api/clubs';
import { loadAthleteTypes } from '../api/config';
import AuthComponent from './AuthComponent';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '35%',
  minWidth: 400,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
};

const AthleteModal = ({
  open,
  onClose,
  onSubmit,
  athlete,
  isEditMode,
  userClubId,
}) => {
  const [formData, setFormData] = React.useState({});
  const [clubs, setClubs] = React.useState([]);
  const [clubName, setClubName] = React.useState(athlete?.club?.denominazione || '');
  const [clubNames, setClubNames] = React.useState([]);
  const [athleteTypes, setAthleteTypes] = React.useState([]);
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
        luogoNascita: null,
        club: club,
        clubId: club ? club.id : null,
        tesseramento: null,
        peso: null,
        email: null,
        telefono: null,
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
    setFormData({ ...formData, [e.target.name]: e.target.value === '' ? null : e.target.value });
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

  const handleTesseramentoChange = (value) => {
    setFormData({ ...formData, tesseramento: value || null });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || "Errore nel salvataggio dell'atleta");
    }
  };

  return (
    <Modal open={open}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {isEditMode ? 'Modifica Atleta' : 'Aggiungi Atleta'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="nome"
              label="Nome"
              sx={{ minWidth: 250 }}
              value={formData.nome || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="cognome"
              label="Cognome"
              sx={{ minWidth: 250 }}
              value={formData.cognome || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="dataNascita"
              label="Data di Nascita"
              type="date"
              sx={{ minWidth: 250 }}
              value={formData.dataNascita || ''}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="athlete-type-select"
              value={formData.tipoAtleta || null}
              sx={{ minWidth: 250 }}
              getOptionLabel={(option) => option.nome || ''}
              onChange={handleAthleteTypeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo Atleta"
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
              options={athleteTypes}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="gender-select"
              value={formData.sesso || ''}
              sx={{ minWidth: 150 }}
              getOptionLabel={(sesso) => sesso}
              onChange={(event, value) => handleGenderChange(value)}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sesso"
                  fullWidth
                  required
                />
              )}
              options={['M', 'F']}
            />
          </Grid>
          <Grid item xs={12}>
            <AuthComponent requiredRoles={['admin', 'superAdmin']}>
              <Autocomplete
                id="club-select"
                value={clubName}
                sx={{ minWidth: 350 }}
                groupBy={(club) => club.charAt(0).toUpperCase()}
                getOptionLabel={(club) => club}
                onChange={(event, value) => handleClubSelectChange(value)}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Club"
                    fullWidth
                    required
                  />
                )}
                options={clubNames ? [...clubNames].sort((a, b) => a.localeCompare(b)) : []}
              />
            </AuthComponent>
            <AuthComponent requiredRoles={['club']}>
              <TextField
                id="club-select"
                label="Club"
                value={clubName}
                sx={{ minWidth: 350 }}
                fullWidth
                required
                InputProps={{
                  readOnly: true,
                }}
                disabled={false}
              />
            </AuthComponent>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="codiceFiscale"
              label="Codice Fiscale"
              sx={{ minWidth: 250 }}
              value={formData.codiceFiscale || ''}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="luogoNascita"
              label="Luogo di Nascita"
              sx={{ minWidth: 250 }}
              value={formData.luogoNascita || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="tesseramento-select"
              value={formData.tesseramento || ''}
              sx={{ minWidth: 250 }}
              getOptionLabel={(tesseramento) => tesseramento}
              onChange={(event, value) => handleTesseramentoChange(value)}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tesseramento"
                  fullWidth
                />
              )}
              options={['FIWUK', 'ASI']}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="peso"
              label="Peso (kg)"
              sx={{ minWidth: 250 }}
              value={formData.peso || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="Email"
              type="email"
              sx={{ minWidth: 250 }}
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="telefono"
              label="Telefono"
              sx={{ minWidth: 250 }}
              value={formData.telefono || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Annulla</Button>
          <Button type="submit" variant="contained" sx={{ ml: 2 }}>
            {isEditMode ? 'Salva' : 'Aggiungi'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AthleteModal;
