import React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
} from '@mui/material';
import { loadAllClubs } from '../api/clubs';
import { loadBeltDegrees } from '../api/config';

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
}) => {
  const [formData, setFormData] = React.useState({});
  const [clubs, setClubs] = React.useState([]);
  const [clubName, setClubName] = React.useState(athlete?.club?.nome || '');
  const [clubNames, setClubNames] = React.useState([]);
  const [beltDegrees, setBeltDegrees] = React.useState([]);

  React.useEffect(() => {
    if (isEditMode && athlete) {
      setFormData(athlete);
    } else {
      setFormData({
        nome: '',
        cognome: '',
        data_nascita: '',
        grado: null,
        codice_fiscale: '',
        luogo_nascita: '',
        club: null,
        email: '',
        telefono: '',
      });
    }
  }, [open, isEditMode, athlete]);

  React.useEffect(() => {
      const fetchClubs = async () => {
        try {
          const clubsData = await loadAllClubs();
          const clubNames = clubsData.map((club) => club.nome);
          setClubs(clubsData);
          setClubNames(clubNames);
        } catch (error) {
          console.error('Errore nel caricamento dei dati:', error);
        }
      };

      const fetchBeltDegrees = async () => {
        try {
          const beltDegreesData = await loadBeltDegrees();
          setBeltDegrees(beltDegreesData);
        } catch (error) {
          console.error('Errore nel caricamento dei gradi/cinture:', error);
        }
      };

      fetchClubs();
      fetchBeltDegrees();
    }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClubSelectChange = (value) => {
    setClubName(value);
    const selectedClub = clubs.find((club) => club.nome === value);
    setFormData({ ...formData, clubId: selectedClub?.id || null, club: selectedClub || null });
  }

  const handleBeltDegreeChange = (event, value) => {
    setFormData({ ...formData, gradoCinturaId: value ? value.id : null, gradoCintura: value || null });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
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
              name="luogoNascita"
              label="Luogo di Nascita"
              sx={{ minWidth: 250 }}
              value={formData.luogoNascita || ''}
              onChange={handleChange}
              fullWidth
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
            <TextField
              name="codiceFiscale"
              label="Codice Fiscale"
              sx={{ minWidth: 250 }}
              value={formData.codiceFiscale || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="grade-select"
              value={formData.gradoCintura || null}
              sx={{ minWidth: 250 }}
              getOptionLabel={(option) => option.nome || ''}
              groupBy={(option) => option.gruppo}
              onChange={handleBeltDegreeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Grado"
                  variant="outlined"
                  fullWidth
                />
              )}
              options={beltDegrees}
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
          <Grid item xs={12}>
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
                />
              )}
              options={clubNames ? [...clubNames].sort((a, b) => a.localeCompare(b)) : []}
            />
          </Grid>
        </Grid>
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
