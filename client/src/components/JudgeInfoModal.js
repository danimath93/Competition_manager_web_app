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

const JudgeInfoModal = ({ open, onClose, judge }) => {
  if (!judge) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Dettagli Giudice
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>Nome:</strong> {judge.nome}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Cognome:</strong> {judge.cognome}
            </Typography>
          </Grid>
            <Grid item xs={6}>
            <Typography>
              <strong>Data di Nascita:</strong> {format(new Date(judge.dataNascita), 'dd/MM/yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <strong>Codice Fiscale:</strong> {judge.codiceFiscale}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Livello di Esperienza:</strong> {judge.livelloEsperienza}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Specializzazione:</strong> {judge.specializzazione}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <strong>Certificazioni:</strong> {judge.certificazioni}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Telefono:</strong> {judge.telefono}
            </Typography>
          </Grid>          
          <Grid item xs={6}>
            <Typography>
              <strong>Email:</strong> {judge.email}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Club:</strong> {judge.club}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default JudgeInfoModal;
