import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
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
import {
  ExpandMore,
  ExpandLess,
  Add,
  Delete,
  PersonRemove
} from '@mui/icons-material';
import { createRegistration, deleteRegistration, deleteAthleteRegistrations } from '../api/registrations';
import { loadCompetitionCategories } from '../api/competitions';

const RegisteredAthleteCard = ({ athlete, registrations, isClubRegistered, onRegistrationChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'athlete' o 'category'
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleExpanded = () => {
    setExpanded(!expanded);
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

  // Restituisce un colore in base al tipo di competizione
  const getColorByTipoCompetizione = (tipo) => {
    switch (tipo) {
      case 'Kata':
        return 'primary';
      case 'Kumite':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Apre il dialog per eliminare l'atleta
  const handleDeleteAthlete = () => {
    setDeleteType('athlete');
    setDeleteDialogOpen(true);
    setError(null);
  };

  // Apre il dialog per eliminare una categoria specifica
  const handleDeleteCategory = (registration) => {
    setDeleteType('category');
    setSelectedRegistration(registration);
    setDeleteDialogOpen(true);
    setError(null);
  };

  // Chiude il dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteType(null);
    setSelectedRegistration(null);
    setError(null);
  };

  // Conferma l'eliminazione
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      if (deleteType === 'athlete') {
        // Elimina tutte le iscrizioni dell'atleta
        await deleteAthleteRegistrations(athlete.id, registrations[0]?.competizioneId);
      } else if (deleteType === 'category' && selectedRegistration) {
        // Elimina solo l'iscrizione specifica
        await deleteRegistration(selectedRegistration.id);
      }

      handleCloseDeleteDialog();
      onRegistrationChange();
    } catch (err) {
      console.error('Errore nell\'eliminazione:', err);
      setError('Errore nell\'eliminazione');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    setError(null);
    setLoading(true);

    try {
      // Carica le categorie disponibili per la competizione
      const categories = await loadCompetitionCategories(registrations[0]?.competizioneId);
      setAvailableCategories(categories);
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
      setError('Errore nel caricamento delle categorie disponibili');
      setAvailableCategories([]);
    } finally {
      setLoading(false);
    }

    setAddCategoryDialogOpen(true);
  };

  const handleAddCategoryDialogClose = () => {
    setAddCategoryDialogOpen(false);
    setSelectedCategory(null);
    setError(null);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedCategory || !athlete) {
      setError('Seleziona una categoria');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await createRegistration({
        atletaId: athlete.id,
        tipoCategoriaId: selectedCategory,
        competizioneId: registrations[0]?.competizioneId,
        stato: 'Confermata'
      });
      handleAddCategoryDialogClose();
      onRegistrationChange();
    } catch (error) {
      console.error('Errore nella registrazione:', error);
      setError('Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          {/* Informazioni principali dell'atleta */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6">
                {athlete.nome} {athlete.cognome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Età: {calculateAge(athlete.dataNascita)} anni • Peso: {athlete.peso} kg
              </Typography>
              {athlete.grado && (
                <Chip 
                  label={athlete.grado} 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Box>
              <Chip 
                label={`${registrations.length} ${registrations.length === 1 ? 'categoria' : 'categorie'}`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>

        <CardActions>
          {!isClubRegistered && (
            <Button
              size="small"
              startIcon={<Add />}
              onClick={handleAddCategory}
            >
              Aggiungi Categoria
            </Button>
          )}
          {!isClubRegistered && (
            <Button
              size="small"
              color="error"
              startIcon={<PersonRemove />}
              onClick={handleDeleteAthlete}
            >
              Rimuovi Atleta
            </Button>
          )}
          
          <IconButton
            onClick={toggleExpanded}
            sx={{ ml: 'auto' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </CardActions>

        {/* Dettagli delle categorie (espandibile) */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Categorie Iscritte:
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Tipologia</TableCell>
                    <TableCell>Stato</TableCell>
                    <TableCell>Data Iscrizione</TableCell>
                    <TableCell align="center">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.tipoCategoria?.nome || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={registration.tipoCategoria?.tipoCompetizione?.nome || 'N/A'}
                          size="small"
                          color={getColorByTipoCompetizione(registration.tipoCategoria?.tipoCompetizione?.nome)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={registration.stato}
                          size="small"
                          color={registration.stato === 'Confermata' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(registration.dataIscrizione).toLocaleDateString()}
                      </TableCell>
                      {!isClubRegistered && (
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCategory(registration)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
      </Card>

      {/* Dialog per la selezione della categoria */}
      <Dialog open={addCategoryDialogOpen} onClose={handleAddCategoryDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Iscrivi {athlete?.nome} {athlete?.cognome}
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
          <Button onClick={handleAddCategoryDialogClose}>
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
      
      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          {deleteType === 'athlete' 
            ? `Rimuovi ${athlete.nome} ${athlete.cognome} dalla competizione?`
            : `Rimuovi iscrizione alla categoria ${selectedRegistration?.categoria?.nome}?`
          }
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            {deleteType === 'athlete'
              ? 'Questa azione rimuoverà l\'atleta da tutte le categorie della competizione.'
              : 'Questa azione rimuoverà l\'atleta solo da questa categoria specifica.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminazione...' : 'Conferma'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const RegisteredAthletesList = ({ registrations, competitionId, isClubRegistered, onRegistrationChange }) => {
  // Raggruppa le iscrizioni per atleta
  const athleteGroups = registrations.reduce((groups, registration) => {
    const athlete = registration.atleta;
    if (!groups[athlete.id]) {
      groups[athlete.id] = {
        athlete: athlete,
        registrations: []
      };
    }
    groups[athlete.id].registrations.push(registration);
    return groups;
  }, {});

  const groupedAthletes = Object.values(athleteGroups);

  if (groupedAthletes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Nessun atleta iscritto alla competizione
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {groupedAthletes.map((group) => (
        <RegisteredAthleteCard
          key={group.athlete.id}
          athlete={group.athlete}
          registrations={group.registrations}
          isClubRegistered={isClubRegistered}
          onRegistrationChange={onRegistrationChange}
        />
      ))}
    </Box>
  );
};

export default RegisteredAthletesList;