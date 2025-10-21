import React from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Alert,
  Autocomplete,
  TextField,
} from "@mui/material";
import { loadAllClubs } from "../api/clubs";

const CompetitionOrganizerSelectorModal = ({ open, onClose, onSubmit, organizerId }) => {

  const [clubs, setClubs] = React.useState([]);
  const [clubNames, setClubNames] = React.useState([]);
  const [clubName, setClubName] = React.useState('');
  const [selectedClubOrganizer, setSelectedClubOrganizer] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubsData = await loadAllClubs();
        const clubNames = clubsData.map((club) => club.nome);
        setClubs(clubsData);
        setClubNames(clubNames);
        if (organizerId && clubsData.length > 0) {
          const selectedClub = clubsData.find((club) => club.id === organizerId);
          setClubName(selectedClub ? selectedClub.nome : '');
          setSelectedClubOrganizer(organizerId);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };
    fetchClubs();
  }, []);

  const handleSubmit = (selectedOrganizer) => {
    onSubmit(selectedOrganizer);
    onClose();
  };

  const handleClubSelectChange = (value) => {
    setClubName(value);
    const selectedClub = clubs.find((club) => club.nome === value);
    setSelectedClubOrganizer(selectedClub ? selectedClub.id : null);
  }

  const handleConfirmOrganizer = () => {
    handleSubmit(selectedClubOrganizer);
  };

  const handleCloseDialog = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Imposta un club organizzatore della competizione
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mt: 2 }}>
            <Autocomplete
              id="club-select"
              value={clubName}
              sx={{ minWidth: 350 }}
              groupBy={(club) => club.charAt(0).toUpperCase()}
              getOptionLabel={(club) => club}
              onChange={(event, value) => handleClubSelectChange(value)}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Club"
                  fullWidth
                />
              )}
              options={clubNames ? [...clubNames].sort((a, b) => a.localeCompare(b)) : []}
            />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>
          Annulla
        </Button>
        <Button
          onClick={handleConfirmOrganizer}
          variant="contained"
          disabled={loading || !selectedClubOrganizer}
        >
          Conferma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompetitionOrganizerSelectorModal;
