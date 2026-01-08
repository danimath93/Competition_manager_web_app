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
import ConfirmActionModal from './common/ConfirmActionModal';
import { uploadDocumento, downloadDocumento, deleteDocumento, getDocumentoInfo } from '../api/documents';

const CompetitionDocumentsModal = ({ open, onClose, onDocumentChange, competition, userClubId, userPermissions }) => {

  const [files, setFiles] = useState({
    circolareGara: null,
    fileExtra1: null,
    fileExtra2: null,
  });

  const [existingFiles, setExistingFiles] = useState({
    circolare: null,
    extra1: null,
    extra2: null,
  });

  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    message: '',
    error: false,
  });

  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [fileTypeToDelete, setFileTypeToDelete] = useState(null);

  // Verifica se l'utente può modificare i documenti
  const canEdit = () => {
    if (!competition) return false;

    // Admin e SuperAdmin possono sempre modificare
    if (userPermissions === 'admin' || userPermissions === 'superAdmin') {
      return true;
    }

    // Organizzatore della competizione può modificare
    return userClubId === competition.organizzatoreClubId;
  };

  const isEditable = canEdit();

  // Reset dei file quando si chiude il modale
  useEffect(() => {
    if (!open) {
      setFiles({ circolareGara: null, fileExtra1: null, fileExtra2: null });
      setUploadStatus({ loading: false, message: '', error: false });
    }
  }, [open]);

  // Carica i nomi dei file esistenti quando si apre il modal
  useEffect(() => {
    const loadExistingFiles = async () => {
      if (!competition || !open) return;

      const fileNames = {
        circolare: null,
        extra1: null,
        extra2: null,
      };

      try {
        if (competition.circolareGaraId) {
          const result = await getDocumentoInfo(competition.circolareGaraId);
          fileNames.circolare = result.nomeFile;
        }
      } catch (error) {
        console.error('Error loading circolare:', error);
      }

      try {
        if (competition.fileExtra1Id) {
          const result = await getDocumentoInfo(competition.fileExtra1Id);
          fileNames.extra1 = result.nomeFile;
        }
      } catch (error) {
        console.error('Error loading fileExtra1:', error);
      }

      try {
        if (competition.fileExtra2Id) {
          const result = await getDocumentoInfo(competition.fileExtra2Id);
          fileNames.extra2 = result.nomeFile;
        }
      } catch (error) {
        console.error('Error loading fileExtra2:', error);
      }

      setExistingFiles(fileNames);
    };

    loadExistingFiles();
  }, [competition, open]);

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
      // Upload circolare gara
      if (files.circolareGara) {
        await uploadDocumento(files.circolareGara, 'circolare_gara', competition.id, 'competizione');
      }

      // Upload file extra 1
      if (files.fileExtra1) {
        await uploadDocumento(files.fileExtra1, 'file_extra1_competizione', competition.id, 'competizione');
      }
      
      // Upload file extra 2
      if (files.fileExtra2) {
        await uploadDocumento(files.fileExtra2, 'file_extra2_competizione', competition.id, 'competizione');
      }

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

  const handleFileDownload = async (apiFileType) => {
    if (!competition?.id) return;

    try {
      // Determina il documentoId in base al tipo di file
      let documentoId = null;

      if (apiFileType === 'circolare') {
        documentoId = competition.circolareGaraId;
      } else if (apiFileType === 'extra1') {
        documentoId = competition.fileExtra1Id;
      } else if (apiFileType === 'extra2') {
        documentoId = competition.fileExtra2Id;
      } else if (apiFileType === 'locandina') {
        documentoId = competition.locandinaId;
      }

      if (!documentoId) {
        setUploadStatus({
          loading: false,
          message: 'Documento non trovato',
          error: true
        });
        return;
      }

      await downloadDocumento(documentoId);
    } catch (error) {
      setUploadStatus({
        loading: false,
        message: 'Errore durante il download del file',
        error: true
      });
    }
  };

  const handleFileDeleteConfirm = (apiFileType) => {
    setConfirmDeleteModalOpen(true);
    setFileTypeToDelete(apiFileType);
  };

  const handleFileDelete = async () => {
    setConfirmDeleteModalOpen(false);

    if (!competition?.id) return;

    try {
      // Determina il documentoId e il tipoDocumento in base al tipo di file
      let documentoId = null;
      let tipoDocumento = null;

      if (fileTypeToDelete === 'circolare') {
        documentoId = competition.circolareGaraId;
        tipoDocumento = 'circolare_gara';
      } else if (fileTypeToDelete === 'extra1') {
        documentoId = competition.fileExtra1Id;
        tipoDocumento = 'file_extra1_competizione';
      } else if (fileTypeToDelete === 'extra2') {
        documentoId = competition.fileExtra2Id;
        tipoDocumento = 'file_extra2_competizione';
      } else if (fileTypeToDelete === 'locandina') {
        documentoId = competition.locandinaId;
        tipoDocumento = 'locandina_competizione';
      }

      if (!documentoId) {
        setUploadStatus({
          loading: false,
          message: 'Documento non trovato',
          error: true
        });
        return;
      }

      await deleteDocumento(documentoId, competition.id, 'competizione', tipoDocumento);
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

  const renderFileSection = (title, fileType, apiFileType, acceptedTypes) => {
    const existingFileName = existingFiles[apiFileType];
    const selectedFile = files[fileType];

    return (
      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>

          <div style={{ marginLeft: "auto", cursor: 'pointer' }}>
            {existingFileName && (
              <IconButton
                size="small"
                style={{ marginLeft: "auto" }}
                onClick={() => handleFileDownload(apiFileType)}
                title="Download"
              >
                <DownloadIcon />
              </IconButton>
            )}
            {isEditable && (
              <>
                <input
                  accept={acceptedTypes}
                  type="file"
                  id={`${fileType}-upload`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(fileType, e)}
                />
                <label htmlFor={`${fileType}-upload`}>
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
            {existingFileName && isEditable && (
              <IconButton
                size="small"
                onClick={() => handleFileDeleteConfirm(apiFileType)}
                title="Elimina"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </div>
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
 
        {/* Messaggio di stato upload */}
        {uploadStatus.message && (
          <Alert severity={uploadStatus.error ? 'error' : 'success'} sx={{ mb: 2 }}>
            {uploadStatus.message}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
      {confirmDeleteModalOpen && (
        <ConfirmActionModal
          open={confirmDeleteModalOpen}
          onClose={() => setConfirmDeleteModalOpen(false)}
          title="Conferma eliminazione"
          message="Eliminare definitivamente il file selezionato?"
          primaryButton={{
            text: 'Elimina',
            onClick: () => {handleFileDelete(fileTypeToDelete);}
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setConfirmDeleteModalOpen(false)
          }}
        />
      )}
    </Dialog>
    
  );
};

export default CompetitionDocumentsModal;
