import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  Download as DownloadIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { uploadCompetitionFiles, downloadCompetitionFile, deleteCompetitionFile } from '../api/competitions';
import { CompetitionStatus, CompetitionLevel  } from '../constants/enums/CompetitionEnums';
import CompetitionTypologySelector from './CompetitionTypologySelector';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  minWidth: 900,
  maxWidth: 1200,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
};

const CompetitionModal = ({ open, onClose, onSubmit, isEditMode, competition }) => {
  const [formData, setFormData] = useState({
    nome: '',
    dataInizio: '',
    dataFine: '',
    luogo: '',
    indirizzo: '',
    tipologia: [], // Ora è un array di ID
    livello: CompetitionLevel.REGIONAL,
    stato: CompetitionStatus.PLANNED,
    dataScadenzaIscrizioni: '',
    descrizione: '',
  });

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

  useEffect(() => {
    if (isEditMode && competition) {
      setFormData({
        id: competition.id,
        nome: competition.nome || '',
        dataInizio: competition.dataInizio ? competition.dataInizio.split('T')[0] : '',
        dataFine: competition.dataFine ? competition.dataFine.split('T')[0] : '',
        tipologia: Array.isArray(competition.tipologia) ? competition.tipologia : [],
        livello: competition.livello || '',
        dataScadenzaIscrizioni: competition.dataScadenzaIscrizioni ? competition.dataScadenzaIscrizioni.split('T')[0] : '',
        luogo: competition.luogo || '',
        indirizzo: competition.indirizzo || '',
        stato: competition.stato || CompetitionStatus.PLANNED,
        descrizione: competition.descrizione || '',
      });
    } else {
      setFormData({
        nome: '',
        dataInizio: '',
        dataFine: '',
        tipologia: [],
        livello: CompetitionLevel.REGIONAL,
        stato: CompetitionStatus.PLANNED,
        dataScadenzaIscrizioni: '',
        luogo: '',
        indirizzo: '',
        descrizione: '',
      });
    }
  }, [isEditMode, competition, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTipologiaChange = (selectedIds) => {
    setFormData({ ...formData, tipologia: selectedIds });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validazione: verifica che almeno una tipologia sia selezionata
    if (!formData.tipologia || formData.tipologia.length === 0) {
      setUploadStatus({
        loading: false,
        message: 'Seleziona almeno una tipologia di competizione',
        error: true,
      });
      return;
    }
    
    onSubmit(formData);
  };

  const handleFileChange = (fileType, event) => {
    const file = event.target.files[0];
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleFileUpload = async () => {
    if (!isEditMode || !competition?.id) {
      setUploadStatus({
        loading: false,
        message: 'Devi prima salvare la competizione per caricare i file',
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

    try {
      await deleteCompetitionFile(competition.id, fileType);
      setUploadStatus({
        loading: false,
        message: 'File eliminato con successo',
        error: false
      });
    } catch (error) {
      setUploadStatus({
        loading: false,
        message: 'Errore durante l\'eliminazione del file',
        error: true
      });
    }
  };

  const getFileDisplayName = (fileType) => {
    switch (fileType) {
      case 'circolare': return competition?.circolareGaraNome;
      case 'extra1': return competition?.fileExtra1Nome;
      case 'extra2': return competition?.fileExtra2Nome;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" >
      <DialogTitle>{isEditMode ? 'Modifica Competizione' : 'Aggiungi Competizione'}</DialogTitle>
      <form onSubmit={handleSubmit} minWidth={900}>
        <DialogContent>
          <TextField
            name="nome"
            label="Nome Competizione"
            value={formData.nome}
            onChange={handleChange}
            fullWidth
            required
          />
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataInizio"
                label="Data Inizio"
                type="date"
                value={formData.dataInizio}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataFine"
                label="Data Fine"
                type="date"
                value={formData.dataFine}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataScadenzaIscrizioni"
                label="Data Scadenza Iscrizioni"
                type="date"
                value={formData.dataScadenzaIscrizioni}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="luogo"
                label="Luogo"
                sx={{ mb: 2 }}
                value={formData.luogo}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="livello"
                label="Livello"
                value={formData.livello}
                onChange={handleChange}
                fullWidth
                required
                select
                SelectProps={{ native: true }}
              >
                {Object.entries(CompetitionLevel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            name="indirizzo"
            label="Indirizzo"
            value={formData.indirizzo}
            onChange={handleChange}
            fullWidth
          />
          <Divider sx={{ my: 2 }} />
          <CompetitionTypologySelector
            value={formData.tipologia}
            onChange={handleTipologiaChange}
            error={!formData.tipologia || formData.tipologia.length === 0}
            helperText={!formData.tipologia || formData.tipologia.length === 0 ? 'Seleziona almeno una tipologia' : ''}
          />
          <TextField
            name="descrizione"
            label="Descrizione"
            value={formData.descrizione}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h8">
            Modifica lo stato della competizione:
          </Typography>

          <TextField
            name="stato"
            value={formData.stato}
            onChange={handleChange}
            sx={{ mt: 1 }}
            fullWidth
            required
            select
            SelectProps={{ native: true }}
          >
            {Object.entries(CompetitionStatus).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </TextField>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Documenti
          </Typography>

          {/* Upload Status Message */}
          {uploadStatus.message && (
            <Alert severity={uploadStatus.error ? 'error' : 'success'}>
              {uploadStatus.message}
            </Alert>
          )}

          {/* Circolare di Gara */}
          <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Circolare di Gara
              </Typography>
              <input
                accept=".pdf,.doc,.docx,.txt"
                type="file"
                id="circolare-upload"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange('circolareGara', e)}
              />
              <label htmlFor="circolare-upload" style={{ marginLeft: "auto", cursor: 'pointer' }}>
                <IconButton
                  component="span"
                  size="small"
                  title="Carica file"
                >
                  <UploadIcon />
                </IconButton>
              </label>
              {isEditMode && getFileDisplayName('circolare') && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleFileDownload('circolare')}
                    title="Download"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleFileDelete('circolare')}
                    title="Elimina"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {!files.circolareGara && !getFileDisplayName('circolare') && (
                <Typography variant="body2" color="text.secondary">
                  Selezionare un file da caricare...
                </Typography>
              )}
              {files.circolareGara && (
                <Typography variant="body2" color="text.secondary">
                  {files.circolareGara.name}
                </Typography>
              )}
              {isEditMode && getFileDisplayName('circolare') && (
                <Typography variant="body2">
                  {getFileDisplayName('circolare')}
                </Typography>
              )}
            </Box>
          </Box>


          <Grid container spacing={2}>



            {/* File Extra 1 */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  File Extra 1
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <input
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                    type="file"
                    id="extra1-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange('fileExtra1', e)}
                  />
                  <label htmlFor="extra1-upload">
                    <Button variant="outlined" component="span" startIcon={<UploadIcon />} size="small">
                      Seleziona
                    </Button>
                  </label>
                  {files.fileExtra1 && (
                    <Typography variant="caption" color="text.secondary">
                      {files.fileExtra1.name}
                    </Typography>
                  )}
                </Box>
                {isEditMode && getFileDisplayName('extra1') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption">
                      {getFileDisplayName('extra1')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleFileDownload('extra1')}
                      title="Download"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleFileDelete('extra1')}
                      title="Elimina"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* File Extra 2 */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  File Extra 2
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <input
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                    type="file"
                    id="extra2-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange('fileExtra2', e)}
                  />
                  <label htmlFor="extra2-upload">
                    <Button variant="outlined" component="span" startIcon={<UploadIcon />} size="small">
                      Seleziona
                    </Button>
                  </label>
                  {files.fileExtra2 && (
                    <Typography variant="caption" color="text.secondary">
                      {files.fileExtra2.name}
                    </Typography>
                  )}
                </Box>
                {isEditMode && getFileDisplayName('extra2') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption">
                      {getFileDisplayName('extra2')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleFileDownload('extra2')}
                      title="Download"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleFileDelete('extra2')}
                      title="Elimina"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Pulsante Upload File */}
            {isEditMode && (Object.values(files).some(file => file !== null)) && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleFileUpload}
                  disabled={uploadStatus.loading}
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  {uploadStatus.loading ? 'Caricamento...' : 'Carica File Selezionati'}
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annulla</Button>
          <Button type="submit" variant="contained">
            {isEditMode ? 'Salva Modifiche' : 'Crea'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CompetitionModal;
