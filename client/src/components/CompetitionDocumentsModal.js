import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  Download as DownloadIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { 
  uploadCompetitionFiles, 
  downloadCompetitionFile, 
  deleteCompetitionFile 
} from '../api/competitions';

const CompetitionDocumentsModal = ({ open, onClose, onDocumentChange, competition }) => {
  const { user } = useAuth();
  
  const [files, setFiles] = useState({
    circolareGara: null,
    fileExtra1: null,
    fileExtra2: null,
  });

  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    message: '',
    error: false,
  });

  // Verifica se l'utente può modificare i documenti
  const canEdit = () => {
    if (!user || !competition) return false;
    
    // Admin e SuperAdmin possono sempre modificare
    if (user.permissions === 'admin' || user.permissions === 'superAdmin') {
      return true;
    }
    
    // TODO: Aggiungere controllo per organizzatore della gara
    // return user.clubId === competition.organizzatoreClubId;
    
    return false;
  };

  const isEditable = canEdit();

  // Reset dei file quando si chiude il modale
  useEffect(() => {
    if (!open) {
      setFiles({ circolareGara: null, fileExtra1: null, fileExtra2: null });
      setUploadStatus({ loading: false, message: '', error: false });
    }
  }, [open]);

  const handleFileChange = (fileType, event) => {
    const file = event.target.files[0];
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleFileUpload = async () => {
    if (!competition?.id) {
      setUploadStatus({
        loading: false,
        message: 'Errore: competizione non valida',
        error: true
      });
      return;
    }

    const filesToUpload = Object.fromEntries(
      Object.entries(files).filter(([_, file]) => file !== null)
    );

    if (Object.keys(filesToUpload).length === 0) {
      setUploadStatus({
        loading: false,
        message: 'Seleziona almeno un file da caricare',
        error: true
      });
      return;
    }

    setUploadStatus({ loading: true, message: '', error: false });

    try {
      await uploadCompetitionFiles(competition.id, filesToUpload);
      setUploadStatus({
        loading: false,
        message: 'File caricati con successo',
        error: false
      });
      setFiles({ circolareGara: null, fileExtra1: null, fileExtra2: null });
      
      // Reset dei file input
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      
      setTimeout(() => {
        setUploadStatus({ loading: false, message: '', error: false });
      }, 2000);

      onDocumentChange();
    } catch (error) {
      setUploadStatus({
        loading: false,
        message: 'Errore durante il caricamento dei file',
        error: true
      });
    }
  };

  const handleFileDownload = async (fileType) => {
    if (!competition?.id) return;

    try {
      await downloadCompetitionFile(competition.id, fileType);
    } catch (error) {
      setUploadStatus({
        loading: false,
        message: 'Errore durante il download del file',
        error: true
      });
    }
  };

  const handleFileDelete = async (fileType) => {
    if (!competition?.id) return;

    if (!window.confirm('Sei sicuro di voler eliminare questo file?')) {
      return;
    }

    try {
      await deleteCompetitionFile(competition.id, fileType);
      setUploadStatus({
        loading: false,
        message: 'File eliminato con successo',
        error: false
      });
      
      setTimeout(() => {
        setUploadStatus({ loading: false, message: '', error: false });
      }, 2000);

      onDocumentChange();
    } catch (error) {
      setUploadStatus({
        loading: false,
        message: 'Errore durante l\'eliminazione del file',
        error: true
      });
    }
  };

  const getFileDisplayName = (fileType) => {
    if (!competition) return null;
    
    switch (fileType) {
      case 'circolare': return competition.circolareGaraNome;
      case 'extra1': return competition.fileExtra1Nome;
      case 'extra2': return competition.fileExtra2Nome;
      default: return null;
    }
  };

  const renderFileSection = (title, fileType, apiFileType, acceptedTypes) => {
    const existingFileName = getFileDisplayName(apiFileType);
    const selectedFile = files[fileType];

    return (
      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          
          {isEditable && (
            <>
              <input
                accept={acceptedTypes}
                type="file"
                id={`${fileType}-upload`}
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(fileType, e)}
              />
              <label htmlFor={`${fileType}-upload`} style={{ marginLeft: "auto", cursor: 'pointer' }}>
                <IconButton
                  component="span"
                  size="small"
                  title="Carica file"
                >
                  <UploadIcon />
                </IconButton>
              </label>
            </>
          )}
          
          {existingFileName && (
            <>
              <IconButton
                size="small"
                onClick={() => handleFileDownload(apiFileType)}
                title="Download"
              >
                <DownloadIcon />
              </IconButton>
              {isEditable && (
                <IconButton
                  size="small"
                  onClick={() => handleFileDelete(apiFileType)}
                  title="Elimina"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {!selectedFile && !existingFileName && (
            <Typography variant="body2" color="text.secondary">
              Nessun file caricato
            </Typography>
          )}
          {selectedFile && (
            <Typography variant="body2" color="primary">
              Selezionato: {selectedFile.name}
            </Typography>
          )}
          {existingFileName && !selectedFile && (
            <Typography variant="body2">
              {existingFileName}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Documenti Competizione
        {!isEditable && (
          <Typography variant="caption" display="block" color="text.secondary">
            (Solo visualizzazione)
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {/* Messaggio di stato upload */}
        {uploadStatus.message && (
          <Alert severity={uploadStatus.error ? 'error' : 'success'} sx={{ mb: 2 }}>
            {uploadStatus.message}
          </Alert>
        )}

        {/* Nome competizione */}
        <Typography variant="h6" gutterBottom>
          {competition?.nome}
        </Typography>

        {/* Circolare di Gara */}
        {renderFileSection(
          'Circolare di Gara',
          'circolareGara',
          'circolare',
          '.pdf,.doc,.docx,.txt'
        )}

        {/* File Extra 1 */}
        {renderFileSection(
          'File Extra 1',
          'fileExtra1',
          'extra1',
          '.pdf,.doc,.docx,.txt,.xls,.xlsx'
        )}

        {/* File Extra 2 */}
        {renderFileSection(
          'File Extra 2',
          'fileExtra2',
          'extra2',
          '.pdf,.doc,.docx,.txt,.xls,.xlsx'
        )}

        {/* Pulsante Upload File */}
        {isEditable && Object.values(files).some(file => file !== null) && (
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={uploadStatus.loading}
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploadStatus.loading ? 'Caricamento...' : 'Carica File Selezionati'}
          </Button>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompetitionDocumentsModal;
