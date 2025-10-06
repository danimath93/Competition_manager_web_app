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

const JudgeModal = ({
  open,
  onClose,
  onSubmit,
  judge,
  isEditMode,
}) => {
  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    if (isEditMode && judge) {
      setFormData(judge);
    } else {
      setFormData({
        nome: '',
        cognome: '',
        dataNascita: '',
        codiceFiscale: '',
        livelloEsperienza: '',
        specializzazione: '',
        certificazioni: '',
        telefono: '',
        email: '',
        clubId: '',
      });
    }
  }, [open, isEditMode, judge]);

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
          {isEditMode ? 'Modifica Giudice' : 'Aggiungi Giudice'}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <TextField
              name="nome"
              label="Nome"
              value={formData.nome || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="cognome"
              label="Cognome"
              value={formData.cognome || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="dataNascita"
              label="Data di Nascita"
              type="date"
              value={formData.dataNascita || ''}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="codiceFiscale"
              label="Codice Fiscale"
              value={formData.codiceFiscale || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>          
          <Grid item xs={12}>
            <TextField
              name="livelloesperienza"
              label="Livello di Esperienza"
              value={formData.livelloEsperienza || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="specializzazione"
              label="Specializzazione"
              value={formData.specializzazione || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="certificazioni"
              label="Certificazioni"
              value={formData.certificazioni || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="telefono"
              label="Telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="club"
              label="Club"
              value={formData.club?.nome || ''}
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

export default JudgeModal;
