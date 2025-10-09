import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';

const CompetitionModal = ({ open, onClose, onSubmit, isEditMode, competition }) => {
  const [formData, setFormData] = useState({
    nome: '',
    data_inizio: '',
    data_fine: '',
    luogo: '',
    descrizione: '',
  });

  useEffect(() => {
    if (isEditMode && competition) {
      setFormData({
        id: competition.id,
        nome: competition.nome || '',
        data_inizio: competition.data_inizio ? competition.data_inizio.split('T')[0] : '',
        data_fine: competition.data_fine ? competition.data_fine.split('T')[0] : '',
        luogo: competition.luogo || '',
        descrizione: competition.descrizione || '',
      });
    } else {
      setFormData({
        nome: '',
        data_inizio: '',
        data_fine: '',
        luogo: '',
        descrizione: '',
      });
    }
  }, [isEditMode, competition, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Modifica Competizione' : 'Aggiungi Competizione'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="nome"
                label="Nome Competizione"
                value={formData.nome}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="data_inizio"
                label="Data Inizio"
                type="date"
                value={formData.data_inizio}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="data_fine"
                label="Data Fine"
                type="date"
                value={formData.data_fine}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="luogo"
                label="Luogo"
                value={formData.luogo}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="descrizione"
                label="Descrizione"
                value={formData.descrizione}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annulla</Button>
          <Button type="submit" variant="contained">
            {isEditMode ? 'Salva Modifiche' : 'Crea'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CompetitionModal;
