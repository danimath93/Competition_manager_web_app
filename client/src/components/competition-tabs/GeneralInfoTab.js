import React from 'react';
import { TextField, Grid, Box } from '@mui/material';
import { CompetitionStatus, CompetitionLevel } from '../../constants/enums/CompetitionEnums';

const GeneralInfoTab = ({ formData, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
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

        <Grid item xs={12} sm={6}>
          <TextField
            name="luogo"
            label="Luogo"
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
              <option key={value} value={label}>
                {label}
              </option>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="indirizzo"
            label="Indirizzo"
            value={formData.indirizzo}
            onChange={handleChange}
            fullWidth
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

        <Grid item xs={12}>
          <TextField
            name="stato"
            label="Stato Competizione"
            value={formData.stato}
            onChange={handleChange}
            fullWidth
            required
            select
            SelectProps={{ native: true }}
          >
            {Object.entries(CompetitionStatus).map(([value, label]) => (
              <option key={value} value={label}>
                {label}
              </option>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralInfoTab;
