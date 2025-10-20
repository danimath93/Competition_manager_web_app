import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';

const CategoryExecution = ({ competizioneId, competition }) => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gestione Esecuzione Gara
        </Typography>
        
        <Alert severity="info">
          Questa sezione è in fase di sviluppo. Qui sarà possibile gestire:
          <ul>
            <li>Sorteggio atleti</li>
            <li>Gestione turni</li>
            <li>Inserimento risultati</li>
            <li>Tabelloni</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default CategoryExecution;
