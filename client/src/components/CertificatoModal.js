import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Stack
} from '@mui/material';
import { CloudUpload, Close, Download, Delete } from '@mui/icons-material';
import { uploadCertificato, downloadCertificato, deleteCertificato } from '../api/certificati';

const CertificatoModal = ({ open, onClose, atleta, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verifica dimensione (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Il file è troppo grande. Dimensione massima: 10MB');
        return;
      }

      // Verifica tipo file
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Formato non supportato. Sono accettati solo PDF e immagini (JPG, PNG)');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Seleziona un file prima di caricarlo');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await uploadCertificato(atleta.id, selectedFile);
      setSuccess('Certificato caricato con successo!');
      setSelectedFile(null);
      
      // Chiama la callback di successo dopo 1.5 secondi
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il caricamento del certificato');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadCertificato(atleta.id);
      const url = window.URL.createObjectURL(blob);
      const fileType = blob.type || 'application/pdf';
      const fileExtension = fileType.split('/')[1] || 'pdf';
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificato_${atleta.cognome}_${atleta.nome}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il download del certificato');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare il certificato?')) {
      return;
    }

    try {
      await deleteCertificato(atleta.id);
      setSuccess('Certificato eliminato con successo!');
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante l\'eliminazione del certificato');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const hasCertificato = !!atleta?.certificatoId;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Certificato Medico - {atleta?.nome} {atleta?.cognome}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={2}>
          {atleta?.scadenzaCertificato && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Data scadenza certificato:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {new Date(atleta.scadenzaCertificato).toLocaleDateString('it-IT')}
              </Typography>
            </Box>
          )}

          {hasCertificato && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Certificato presente
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  fullWidth
                >
                  Scarica
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                  fullWidth
                >
                  Elimina
                </Button>
              </Stack>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {hasCertificato ? 'Sostituisci certificato' : 'Carica nuovo certificato'}
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Seleziona file
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFile && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  File selezionato: {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dimensione: {(selectedFile.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Formati accettati: PDF, JPG, PNG (max 10MB)
            </Typography>
          </Box>

          {uploading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Caricamento in corso...
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Chiudi
        </Button>
        {selectedFile && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={<CloudUpload />}
          >
            Carica
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CertificatoModal;
