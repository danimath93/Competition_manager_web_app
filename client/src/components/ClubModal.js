import React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ClubModal = ({
  open,
  onClose,
  onSubmit,
  club,
  isEditMode,
}) => {
  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    if (isEditMode && club) {
      setFormData(club);
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
      });
    }
  }, [open, isEditMode, club]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {isEditMode ? 'Modifica Club' : 'Aggiungi Club'}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <TextField
              name="denominazione"
              label="Denominazione"
              value={formData.denominazione || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="codiceFiscale"
              label="Codice Fiscale"
              value={formData.codiceFiscale || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="partitaIva"
              label="Partita IVA"
              value={formData.partitaIva || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="indirizzo"
              label="Indirizzo"
              value={formData.indirizzo || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="legaleRappresentante"
              label="Legale Rappresentante"
              value={formData.legaleRappresentante || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="direttoreTecnico"
              label="Direttore Tecnico"
              value={formData.direttoreTecnico || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="recapitoTelefonico"
              label="Recapito Telefonico"
              value={formData.recapitoTelefonico || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
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

export default ClubModal;
