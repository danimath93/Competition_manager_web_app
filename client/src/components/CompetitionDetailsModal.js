import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';

const CompetitionDetailsModal = ({ open, onClose, competitionDetails }) => {
  if (!competitionDetails) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Dettagli Competizione: {competitionDetails.nome}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Informazioni Generali</Typography>
          <Typography><strong>Luogo:</strong> {competitionDetails.luogo}</Typography>
          <Typography>
            <strong>Periodo:</strong> {format(new Date(competitionDetails.data_inizio), 'dd/MM/yyyy')} - {format(new Date(competitionDetails.data_fine), 'dd/MM/yyyy')}
          </Typography>
          <Typography><strong>Descrizione:</strong> {competitionDetails.descrizione || 'N/A'}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6">Club Iscritti</Typography>
          {competitionDetails.clubs && competitionDetails.clubs.length > 0 ? (
            <List>
              {competitionDetails.clubs.map((club) => (
                <ListItem key={club.id}>
                  <ListItemText 
                    primary={club.nome} 
                    secondary={`Numero atleti: ${club.numero_atleti_iscritti}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Nessun club iscritto al momento.</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompetitionDetailsModal;
