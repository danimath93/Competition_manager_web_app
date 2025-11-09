import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
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
  const competitionId = clubRegistration.competizioneId;
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [error, setError] = useState(null);

  const [files, setFiles] = useState({
    certificatiMedici: clubRegistration.certificatiMedici || null,
    autorizzazioni: clubRegistration.autorizzazioni || null,
  });

  const [fileNames, setFileNames] = useState({
    certificatiMedici: clubRegistration.certificatiMediciNome || '',
    autorizzazioni: clubRegistration.autorizzazioniNome || '',
  });

  const [uploadStatus, setUploadStatus] = useState({
    message: '',
    error: false,
  });

  useEffect(() => {
    // Aggiorna i nomi dei file quando cambiano i props iniziali
    setFileNames({
      certificatiMedici: clubRegistration.certificatiMediciNome || '',
      autorizzazioni: clubRegistration.autorizzazioniNome || '',
    });
  }, [clubRegistration]);

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

    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    setFileNames(prev => ({
      ...prev,
      [fileType]: file.name
    }));

    setUploadStatus({
      message: '',
      error: false
    });
  };

  const handleRemoveFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));

    // Non rimuovere il nome se era un file già caricato in precedenza
    // Solo se è un nuovo file selezionato
    if (files[fileType]) {
      setFileNames(prev => ({
        ...prev,
        [fileType]: null
      }));
    }

    // Reset input file
    const input = document.getElementById(`${fileType}-input`);
    if (input) input.value = '';
  };

  const handleCloseModal = () => {
    if (onClose) onClose();
  };

  const handleUploadDocuments = async () => {
    if (!files.certificatiMedici || !files.autorizzazioni) {
      setUploadStatus({
        message: 'Entrambi i documenti sono obbligatori',
        error: true
      });
      return;
    }

    try {
      setUploadingDocuments(true);

      // Upload documenti
      await uploadClubRegistrationDocuments(
        user.clubId,
        competitionId,
        files.certificatiMedici,
        files.autorizzazioni
      );
      setError(null);
      if (onClose)
        onClose();      
    } catch (err) {
      console.error('Errore durante il caricamento dei documenti:', err);
      setError('Errore durante il caricamento dei documenti: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingDocuments(false);
    }
  };

  const FileUploadBox = ({ fileType, label, description }) => {
    const hasFile = files[fileType] || fileNames[fileType];
    const fileName = files[fileType]?.name || fileNames[fileType];

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
          {hasFile && !disabled && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveFile(fileType)}
              title="Rimuovi file"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {description}
        </Typography>

        {!hasFile ? (
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
        ) : (
          <Box>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
              File selezionato:
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
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
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
              <strong>Documenti obbligatori:</strong> Per confermare l'iscrizione è necessario caricare entrambi i documenti in formato PDF.
            </Typography>
          </Alert>
          <FileUploadBox
            fileType="certificatiMedici"
            label="Certificati Medici"
            description="Carica il PDF contenente i certificati medici di tutti gli atleti iscritti."
          />

          <FileUploadBox
            fileType="autorizzazioni"
            label="Autorizzazioni"
            description="Carica il PDF contenente le autorizzazioni necessarie per la partecipazione."
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleCloseModal}
          disabled={uploadingDocuments}
        >
          Annulla
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadDocuments}
          disabled={uploadingDocuments}
        >
          {uploadingDocuments ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Caricamento...
            </>
          ) : (
            'Carica Documenti'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDocumentsUploadModal;
