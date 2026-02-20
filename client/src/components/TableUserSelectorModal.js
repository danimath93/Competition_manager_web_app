import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { getTableUsers } from '../api/auth';

const TableUserSelectorModal = ({ open, onClose, onConfirm, currentUserId }) => {
  const [tableUsers, setTableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadTableUsers();
      setSelectedUserId(currentUserId || '');
    }
  }, [open, currentUserId]);

  const loadTableUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTableUsers();
      setTableUsers(response.users || []);
    } catch (err) {
      setError('Errore nel caricamento degli utenti con permessi tavolo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    // Invia null se la stringa è vuota, altrimenti invia l'ID
    onConfirm(selectedUserId || null);
    onClose();
  };

  const handleClose = () => {
    setSelectedUserId(currentUserId || '');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleziona utente</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="table-user-select-label">Utente Tavolo</InputLabel>
            <Select
              labelId="table-user-select-label"
              id="table-user-select"
              value={selectedUserId}
              label="Utente Tavolo"
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <MenuItem value="">
                <em>Nessuno</em>
              </MenuItem>
              {tableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Annulla
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          Conferma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableUserSelectorModal;
