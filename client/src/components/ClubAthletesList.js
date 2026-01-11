import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Typography,
  Box,
  Dialog,
  DialogContent,
  Tooltip
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import SearchTextField from './SearchTextField';
import AthleteRegistration from './AthleteRegistration';

const ClubAthletesList = ({ athletes, competition, isClubRegistered, onRegistrationSuccess, onEditAthlete }) => {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Funzione per aprire il dialog di iscrizione
  const handleRegisterAthlete = async (athlete) => {
    setSelectedAthlete(athlete);
    setIsCategorySelectorOpen(true);
  };

  // Funzione per chiudere il dialog
  const handleCloseCategorySelector = () => {
    setIsCategorySelectorOpen(false);
    setSelectedAthlete(null);
  };

  // Funzione chiamata al completamento dell'iscrizione
  const handleRegistrationSuccess = async () => {
    setIsCategorySelectorOpen(false);
    setSelectedAthlete(null);
    if (onRegistrationSuccess) {
      await onRegistrationSuccess();
    }
  };

  // Filtra gli atleti in base al testo di ricerca
  const filteredAthletes = athletes.filter((athlete) => {
    const fullName = `${athlete.nome} ${athlete.cognome}`.toLowerCase();
    return fullName.includes(searchText.toLowerCase());
  });

  if (!athletes || athletes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Nessun atleta trovato nel club
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <SearchTextField
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Cerca atleta..."
      />
      <List>
        {filteredAthletes.map((athlete) => (
          <ListItem key={athlete.id} divider sx={{ alignItems: "flex-start", py: 2 }}>
            <ListItemText
              primary={`${athlete.cognome} ${athlete.nome}`}
            />
            <ListItemSecondaryAction>
            {!isClubRegistered && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Iscrivi Atleta" arrow>                    
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ p: 0.5, minWidth: 20 }}
                    onClick={() => handleRegisterAthlete(athlete)}
                  >
                    <PersonAdd />
                  </Button>
                </Tooltip>
                
              </Box>
            )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Registrazione atleta */}
      <Dialog
        open={isCategorySelectorOpen}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: '10px', height: '100%', overflow: 'auto' }}>
          <AthleteRegistration
            athlete={selectedAthlete}
            competition={competition}
            onUpdateAthlete={onEditAthlete}
            onRegistrationComplete={handleRegistrationSuccess}
            onCancel={handleCloseCategorySelector}
            fullWidth={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClubAthletesList;