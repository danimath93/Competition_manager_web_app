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
  Alert
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { createRegistration } from '../api/registrations';
import { loadCompetitionCategories } from '../api/competitions';

const ClubAthletesList = ({ athletes, competitionId, onRegistrationSuccess }) => {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funzione per aprire il dialog di iscrizione
  const handleRegisterAthlete = async (athlete) => {
    setSelectedAthlete(athlete);
    setError(null);
    setLoading(true);

    try {
      // Carica le categorie disponibili per la competizione
      const categories = await loadCompetitionCategories(competitionId);
      setAvailableCategories(categories);
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
      setError('Errore nel caricamento delle categorie disponibili');
      setAvailableCategories([]);
    } finally {
      setLoading(false);
    }

    setIsDialogOpen(true);
  };

  // Funzione per chiudere il dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAthlete(null);
    setSelectedCategory('');
    setError(null);
  };

  // Funzione per confermare l'iscrizione
  const handleConfirmRegistration = async () => {
    if (!selectedCategory || !selectedAthlete) {
      setError('Seleziona una categoria');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createRegistration({
        atletaId: selectedAthlete.id,
        tipoCategoriaId: selectedCategory,
        competizioneId: competitionId,
        stato: 'Confermata'
      });

      handleCloseDialog();
      onRegistrationSuccess();
    } catch (err) {
      console.error('Errore nell\'iscrizione:', err);
      setError('Errore nell\'iscrizione dell\'atleta');
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
          <ListItem key={athlete.id} divider>
            <ListItemText
              primary={`${athlete.nome} ${athlete.cognome}`}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Età: {calculateAge(athlete.dataNascita)} anni
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Peso: {athlete.peso} kg
                  </Typography>
                  {athlete.grado && (
                    <Chip 
                      label={athlete.grado} 
                      size="small" 
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => handleRegisterAthlete(athlete)}
              >
                Iscriviti
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Dialog per la selezione della categoria */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Iscrivi {selectedAthlete?.nome} {selectedAthlete?.cognome}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Categoria"
            >
              {availableCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirmRegistration}
            variant="contained"
            disabled={loading || !selectedCategory}
          >
            {loading ? 'Iscrizione...' : 'Conferma Iscrizione'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClubAthletesList;