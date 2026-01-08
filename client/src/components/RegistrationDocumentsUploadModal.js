import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { uploadClubRegistrationDocuments } from '../api/registrations';

const RegistrationDocumentsUploadModal = ({
  open,
  onClose,
  disabled = false,
  clubRegistration = {},
}) => {
  const { user } = useAuth();  
  const competitionId = clubRegistration?.competizioneId;
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [error, setError] = useState(null);

  // File visualizzati (caricati da clubRegistration o nuovi selezionati)
  const [displayedFiles, setDisplayedFiles] = useState({
    confermaPresidente: null
  });

  const [displayedFileNames, setDisplayedFileNames] = useState({
    confermaPresidente: ''
  });

  const [uploadStatus, setUploadStatus] = useState({
    message: '',
    error: false,
  });

  // Carica i file da clubRegistration quando il modal viene aperto
  useEffect(() => {
    if (open) {
      let confermaPresidenteNome = '';
      if (clubRegistration?.confermaPresidenteDocumento && clubRegistration?.confermaPresidenteDocumento.nomeFile) {
        confermaPresidenteNome = clubRegistration.confermaPresidenteDocumento.nomeFile;
      }

      setDisplayedFiles({
        confermaPresidente: null,
      });
      setDisplayedFileNames({
        confermaPresidente: confermaPresidenteNome,
      });
      setUploadStatus({
        message: '',
        error: false,
      });
    }
  }, [open, clubRegistration]);

  const handleFileChange = (fileType, event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      setUploadStatus({
        message: 'Solo file PDF sono accettati',
        error: true
      });
      event.target.value = '';
      return;
    }

    // Verifica dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        message: 'Il file non può superare i 10MB',
        error: true
      });
      event.target.value = '';
      return;
    }

    setDisplayedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    setDisplayedFileNames(prev => ({
      ...prev,
      [fileType]: file.name
    }));

    setUploadStatus({
      message: '',
      error: false
    });
  };

  const handleRemoveFile = (fileType) => {
    setDisplayedFiles(prev => ({
      ...prev,
      [fileType]: null
    }));

    setDisplayedFileNames(prev => ({
      ...prev,
      [fileType]: ''
    }));

    // Reset input file
    const input = document.getElementById(`${fileType}-input`);
    if (input) input.value = '';
  };

  const handleResetAll = () => {
    setDisplayedFiles({
      confermaPresidente: null,
    });
    setDisplayedFileNames({
      confermaPresidente: '',
    });
    
    // Reset degli input file
    const inputConferma = document.getElementById('confermaPresidente-input');
    if (inputConferma) inputConferma.value = '';
  };

  const handleCloseModal = () => {
    if (onClose) onClose();
  };

  const handleUploadDocuments = async () => {
    // Verifica che ci sia il file da caricare
    if (!displayedFiles.confermaPresidente) {
      setUploadStatus({
        message: 'Il documento di conferma del presidente è obbligatorio',
        error: true
      });
      return;
    }

    try {
      setUploadingDocuments(true);

      // Upload documento
      await uploadClubRegistrationDocuments(
        user.clubId,
        competitionId,
        displayedFiles.confermaPresidente
      );
      setError(null);
      if (onClose)
        onClose();      
    } catch (err) {
      console.error('Errore durante il caricamento del documento:', err);
      setError('Errore durante il caricamento del documento: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingDocuments(false);
    }
  };

  // Verifica se il file è presente
  const hasAnyFile = displayedFileNames.confermaPresidente;
  
  // Verifica se il file è un File object nuovo (non solo nome da DB)
  const hasAllNewFiles = displayedFiles.confermaPresidente;
  
  // Il pulsante "Carica Documento" è abilitato solo se c'è il file NUOVO
  const canUpload = hasAllNewFiles && !uploadingDocuments;

  const FileUploadBox = ({ fileType, label, description }) => {
    const fileName = displayedFileNames[fileType];
    const hasFile = !!fileName;
    // const isNewFile = !!displayedFiles[fileType];

    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 2,
          border: hasFile ? '2px solid #4caf50' : '2px dashed #ccc',
          backgroundColor: hasFile ? '#f1f8f4' : 'transparent'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <PdfIcon sx={{ mr: 1, color: hasFile ? '#4caf50' : '#666' }} />
            <Typography variant="h6" fontWeight="bold">
              {label}
            </Typography>
            {hasFile && <CheckIcon sx={{ ml: 1, color: '#4caf50' }} />}
          </Box>
          {/* {isNewFile && !disabled && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveFile(fileType)}
              title="Rimuovi file selezionato"
            >
              <DeleteIcon />
            </IconButton>
          )} */}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {description}
        </Typography>

        {hasFile && (
          <Box mb={2}>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
              File selezionato:
              {/* {isNewFile ? 'Nuovo file selezionato:' : 'File attuale:'} */}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                wordBreak: 'break-all',
                fontStyle: 'italic'
              }}
            >
              {fileName}
            </Typography>
          </Box>
        )}

        {!hasFile && (
          <Box>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id={`${fileType}-input`}
              type="file"
              onChange={(e) => handleFileChange(fileType, e)}
              disabled={disabled}
            />
            <label htmlFor={`${fileType}-input`}>
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={disabled}
                fullWidth
              >
                Seleziona PDF
              </Button>
            </label>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      keepMounted={false}
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Documenti Iscrizione
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Documento obbligatorio:</strong> Per confermare l'iscrizione è necessario caricare la dichiarazione del presidente in formato PDF.
            </Typography>
          </Alert>

          <FileUploadBox
            fileType="confermaPresidente"
            label="Dichiarazione del Presidente"
            description="Carica il PDF contenente la dichiarazione firmata dal presidente del club."
          />

          {uploadStatus.message && (
            <Alert severity={uploadStatus.error ? 'error' : 'success'} sx={{ mb: 2 }}>
              {uploadStatus.message}
            </Alert>
          )}
          
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            * Formato accettato: PDF | Dimensione massima: 10MB per file
          </Typography>
        </Box>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Box>
          {hasAnyFile && (
            <Button
              onClick={handleResetAll}
              disabled={uploadingDocuments}
              color="warning"
              variant="outlined"
            >
              Reset
            </Button>
          )}
        </Box>
        <Box>
          <Button
            onClick={handleCloseModal}
            disabled={uploadingDocuments}
            sx={{ mr: 1 }}
          >
            Annulla
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadDocuments}
            disabled={!canUpload}
          >
            {uploadingDocuments ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Caricamento...
              </>
            ) : (
              'Carica Documento'
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDocumentsUploadModal;
