import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import { CompetitionStatus, CompetitionLevel  } from '../constants/enums/CompetitionEnums';
import CompetitionTypologySelector from './CompetitionTypologySelector';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  minWidth: 900,
  maxWidth: 1200,
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

const CompetitionModal = ({ open, onClose, onSubmit, isEditMode, competition }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isEditMode && competition) {
      setFormData({
        id: competition.id,
        nome: competition.nome || '',
        dataInizio: competition.dataInizio ? competition.dataInizio.split('T')[0] : '',
        dataFine: competition.dataFine ? competition.dataFine.split('T')[0] : '',
        tipologia: Array.isArray(competition.tipologia) ? competition.tipologia : [],
        livello: competition.livello || '',
        dataScadenzaIscrizioni: competition.dataScadenzaIscrizioni ? competition.dataScadenzaIscrizioni.split('T')[0] : '',
        luogo: competition.luogo || '',
        indirizzo: competition.indirizzo || '',
        stato: competition.stato || CompetitionStatus.PLANNED,
        descrizione: competition.descrizione || '',
      });
    } else {
      setFormData({
        nome: '',
        dataInizio: '',
        dataFine: '',
        tipologia: [],
        livello: CompetitionLevel.REGIONAL,
        stato: CompetitionStatus.PLANNED,
        dataScadenzaIscrizioni: '',
        luogo: '',
        indirizzo: '',
        descrizione: '',
      });
    }
  }, [isEditMode, competition, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTipologiaChange = (selectedIds) => {
    setFormData({ ...formData, tipologia: selectedIds });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validazione: verifica che almeno una tipologia sia selezionata
    if (!formData.tipologia || formData.tipologia.length === 0) {
      alert('Seleziona almeno una tipologia di competizione');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" >
      <DialogTitle>{isEditMode ? 'Modifica Competizione' : 'Aggiungi Competizione'}</DialogTitle>
      <form onSubmit={handleSubmit} minWidth={900}>
        <DialogContent>
          <TextField
            name="nome"
            label="Nome Competizione"
            value={formData.nome}
            onChange={handleChange}
            fullWidth
            required
          />
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataInizio"
                label="Data Inizio"
                type="date"
                value={formData.dataInizio}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataFine"
                label="Data Fine"
                type="date"
                value={formData.dataFine}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataScadenzaIscrizioni"
                label="Data Scadenza Iscrizioni"
                type="date"
                value={formData.dataScadenzaIscrizioni}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="luogo"
                label="Luogo"
                sx={{ mb: 2 }}
                value={formData.luogo}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="livello"
                label="Livello"
                value={formData.livello}
                onChange={handleChange}
                fullWidth
                required
                select
                SelectProps={{ native: true }}
              >
                {Object.entries(CompetitionLevel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            name="indirizzo"
            label="Indirizzo"
            value={formData.indirizzo}
            onChange={handleChange}
            fullWidth
          />
          <Divider sx={{ my: 2 }} />
          <CompetitionTypologySelector
            value={formData.tipologia}
            onChange={handleTipologiaChange}
            error={!formData.tipologia || formData.tipologia.length === 0}
            helperText={!formData.tipologia || formData.tipologia.length === 0 ? 'Seleziona almeno una tipologia' : ''}
          />
          <TextField
            name="descrizione"
            label="Descrizione"
            value={formData.descrizione}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h8">
            Modifica lo stato della competizione:
          </Typography>

          <TextField
            name="stato"
            value={formData.stato}
            onChange={handleChange}
            sx={{ mt: 1 }}
            fullWidth
            required
            select
            SelectProps={{ native: true }}
          >
            {Object.entries(CompetitionStatus).map(([value, label]) => (
              <option key={value} value={label}>{label}</option>
            ))}
          </TextField>
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
