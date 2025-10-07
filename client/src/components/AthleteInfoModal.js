import React from 'react';
import { Modal, Box, Typography, Grid } from '@mui/material';
import { format } from 'date-fns';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const AthleteInfoModal = ({ open, onClose, athlete }) => {
  if (!athlete) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Dettagli Atleta
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>Nome:</strong> {athlete.nome}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Cognome:</strong> {athlete.cognome}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Data di Nascita:</strong> {format(new Date(athlete.dataNascita), 'dd/MM/yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Luogo di Nascita:</strong> {athlete.luogoNascita}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <strong>Codice Fiscale:</strong> {athlete.codiceFiscale}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Grado:</strong> {athlete.grado}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Club:</strong> {athlete?.club?.nome || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Email:</strong> {athlete.email}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Telefono:</strong> {athlete.telefono}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AthleteInfoModal;
