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
  Chip,
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
            <strong>Periodo:</strong> {format(new Date(competitionDetails.dataInizio), 'dd/MM/yyyy')} - {format(new Date(competitionDetails.dataFine), 'dd/MM/yyyy')}
          </Typography>
          
          {/* Mostra le tipologie multiple */}
          {competitionDetails.tipologieDettagli && competitionDetails.tipologieDettagli.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography component="span"><strong>Tipologie:</strong> </Typography>
              <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                {competitionDetails.tipologieDettagli.map((tipologia) => (
                  <Chip
                    key={tipologia.id}
                    label={tipologia.nome}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Typography sx={{ mt: 1 }}><strong>Descrizione:</strong> {competitionDetails.descrizione || 'N/A'}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6">Club Iscritti</Typography>
          {competitionDetails.clubs && competitionDetails.clubs.length > 0 ? (
            <List>
              {competitionDetails.clubs.map((club) => (
                <ListItem key={club.id}>
                  <ListItemText 
                    primary={club.denominazione} 
                    secondary={`Numero atleti: ${club.numeroAtletiIscritti}`}
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
