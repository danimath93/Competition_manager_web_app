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
  Alert,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Add,
  Delete,
  PersonRemove,
  Warning,
  Euro as EuroIcon
} from '@mui/icons-material';
import { createRegistration, deleteRegistration, deleteAthleteRegistrations } from '../api/registrations';
import CategorySelector from './CategorySelector';

const RegisteredAthleteCard = ({ athlete, competition, registrations, isClubRegistered, onRegistrationChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
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

  // Restituisce un colore in base allo stato dell'iscrizione
  const getColorByStato = (stato) => {
    switch (stato?.toLowerCase()) {
      case 'confermata':
        return '#4caf50'; // Verde
      case 'in attesa':
      case 'attesa':
        return '#ff9800'; // Arancione
      case 'rifiutata':
      case 'annullata':
        return '#f44336'; // Rosso
      case 'in corso':
        return '#2196f3'; // Blu
      default:
        return '#9e9e9e'; // Grigio
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
    setIsCategorySelectorOpen(true);
  };

  const handleCloseCategorySelector = () => {
    setIsCategorySelectorOpen(false);
    setError(null);
  };

  const handleConfirmRegistration = async (registrationData) => {
    try {
      setLoading(true);
      setError(null);
      
      await createRegistration({
        atletaId: athlete.id,
        tipoCategoriaId: registrationData.tipoCategoriaId,
        competizioneId: registrations[0]?.competizioneId,
        stato: 'In attesa',
        idConfigEsperienza: registrationData.idConfigEsperienza,
        peso: registrationData.peso
      });
      
      handleCloseCategorySelector();
      onRegistrationChange();
    } catch (error) {
      throw error;
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
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Tesseramento: {athlete.tesseramento || 'N/A'}
                </Typography>
                {(!athlete.tesseramento) && (
                  <Tooltip 
                    title="In mancanza di tesseramento dell'atleta viene applicato un costo di 5 € per integrare l'assicurazione FIWUK" 
                    arrow
                  >
                    <Warning 
                      sx={{ 
                        fontSize: 16, 
                        color: 'warning.main',
                        cursor: 'help'
                      }} 
                    />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Età: {calculateAge(athlete.dataNascita)} anni
              </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              {registrations[0]?.costoIscrizione != null && (
                <Chip 
                  icon={<EuroIcon />}
                  label={`${registrations[0].costoIscrizione} €`} 
                  color="primary"
                  size="small"
                />
              )}
              <Chip
                label={`${registrations.length} ${registrations.length === 1 ? 'categoria' : 'categorie'}`}
                color="primary"
                variant="outlined"
                size="small"
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
          <Box  display="flex" 
                alignItems="center" 
                sx={{ cursor: 'pointer', ml: 'auto' }}
                onClick={toggleExpanded} >
            <Typography variant="body2" color="text.secondary">
              DETTAGLI
            </Typography>
            <IconButton>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardActions>

        {/* Dettagli delle categorie (espandibile) */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ px: 2, pb: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Tipologia</TableCell>
                    <TableCell>Esperienza</TableCell>
                    <TableCell>Peso (kg)</TableCell>
                    <TableCell>Stato</TableCell>
                    {/* <TableCell>Data Iscrizione</TableCell> */}
                    <TableCell align="center">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration?.tipoCategoria?.nome || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={registration?.tipoCategoria?.tipoCompetizione?.nome || 'N/A'}
                          size="small"
                          color={getColorByTipoCompetizione(registration?.tipoCategoria?.tipoCompetizione?.nome)}
                        />
                      </TableCell>
                      <TableCell>{registration?.esperienza?.nome || ''}</TableCell>
                      <TableCell>{registration?.peso || ''}</TableCell>
                      <TableCell>
                        <Tooltip title={registration.stato} arrow>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: getColorByStato(registration.stato),
                              display: 'inline-block',
                              cursor: 'help'
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      {/* <TableCell>
                        {new Date(registration.dataIscrizione).toLocaleDateString()}
                      </TableCell> */}
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

      {/* Nuovo CategorySelector */}
      <CategorySelector
        open={isCategorySelectorOpen}
        onClose={handleCloseCategorySelector}
        onConfirm={handleConfirmRegistration}
        athlete={athlete}
        competition={competition}
        title="Aggiungi Categoria"
      />
      
      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          {deleteType === 'athlete' 
            ? `Rimuovi ${athlete.nome} ${athlete.cognome} dalla competizione?`
            : `Rimuovi iscrizione alla categoria ${selectedRegistration?.tipoCategoria?.nome}?`
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

const RegisteredAthletesList = ({ registrations, competition, isClubRegistered, onRegistrationChange }) => {
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
          competition={competition}
          registrations={group.registrations}
          isClubRegistered={isClubRegistered}
          onRegistrationChange={onRegistrationChange}
        />
      ))}
    </Box>
  );
};

export default RegisteredAthletesList;