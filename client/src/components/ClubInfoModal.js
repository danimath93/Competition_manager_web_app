import React from 'react';
import { Modal, Box, Typography, Grid } from '@mui/material';
//import { format } from 'date-fns';

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

const ClubInfoModal = ({ open, onClose, club }) => {
  if (!club) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Dettagli Club
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>Denominazione:</strong> {club.denominazione}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Codice Fiscale:</strong> {club.codiceFiscale}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Partita IVA:</strong> {club.partitaIva}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Legale Rappresentante:</strong> {club.legaleRappresentante}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Direttore Tecnico:</strong> {club.direttoreTecnico}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Recapito Telefonico:</strong> {club.recapitoTelefonico}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <strong>Indirizzo:</strong> {club.indirizzo}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <strong>Email:</strong> {club.email}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ClubInfoModal;
