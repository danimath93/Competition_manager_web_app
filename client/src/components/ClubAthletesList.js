import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton
} from '@mui/material';
import { PersonAdd, Edit } from '@mui/icons-material';
import { createRegistration } from '../api/registrations';
import CategorySelector from './CategorySelector';

const ClubAthletesList = ({ athletes, competition, isClubRegistered, onRegistrationSuccess, onEditAthlete }) => {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funzione per aprire il dialog di iscrizione
  const handleRegisterAthlete = async (athlete) => {
    setSelectedAthlete(athlete);
    setError(null);
    setIsCategorySelectorOpen(true);
  };

  // Funzione per chiudere il dialog
  const handleCloseCategorySelector = () => {
    setIsCategorySelectorOpen(false);
    setSelectedAthlete(null);
    setError(null);
  };

  // Funzione per confermare l'iscrizione
  const handleConfirmRegistration = async (registrationData) => {
    try {
      setLoading(true);
      setError(null);

      await createRegistration({
        atletaId: selectedAthlete.id,
        tipoCategoriaId: registrationData.tipoCategoriaId,
        competizioneId: competition.id,
        stato: 'In attesa',
        idConfigEsperienza: registrationData.idConfigEsperienza,
        peso: registrationData.peso
      });

      handleCloseCategorySelector();
      onRegistrationSuccess();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calcola l'età dell'atleta
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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
      <List>
        {athletes.map((athlete) => (
          <ListItem key={athlete.id} divider sx={{ alignItems: "flex-start", py: 2 }}>
            <ListItemText
              primary={`${athlete.nome} ${athlete.cognome}`}
              // secondary={
              //   <Box>
              //     <Typography variant="body2" color="text.secondary">
              //       Età: {calculateAge(athlete.dataNascita)} anni
              //     </Typography>
              //     <Typography variant="body2" color="text.secondary">
              //       Peso: {athlete.peso} kg
              //     </Typography>
              //     {athlete.grado && (
              //       <Chip 
              //         label={athlete.grado} 
              //         size="small" 
              //         sx={{ mt: 0.5 }}
              //       />
              //     )}
              //   </Box>
              // }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  aria-label="edit"
                  size="small"
                  variant="outlined"
                  sx={{p:0.5, minWidth: 20}}
                  onClick={() => onEditAthlete(athlete)}
                >
                  <Edit />
                </Button>
                {!isClubRegistered && (
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ p: 0.5, minWidth: 20 }}
                    onClick={() => handleRegisterAthlete(athlete)}
                  >
                    <PersonAdd />
                  </Button>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Nuovo CategorySelector */}
      <CategorySelector
        open={isCategorySelectorOpen}
        onClose={handleCloseCategorySelector}
        onConfirm={handleConfirmRegistration}
        athlete={selectedAthlete}
        competition={competition}
        title="Iscrivi Atleta"
      />
    </>
  );
};

export default ClubAthletesList;