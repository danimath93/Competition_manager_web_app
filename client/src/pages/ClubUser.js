import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Alert,
  Stack,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import { CloudUpload, Close, Download, Delete } from '@mui/icons-material';
import { FaUniversity } from 'react-icons/fa';
import ClubModal from '../components/ClubModal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { loadClubByID, updateClub, uploadLogoClub } from '../api/clubs';
import { getBlobDocumento } from '../api/documents';

const ClubUser = () => {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [logoSource, setLogoSource] = useState(null);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubData = await loadClubByID(user.clubId);
        setClub(clubData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati del club:', error);
      }
    };
    fetchData();
  }, [user]);

  // Carica il logo quando il club viene caricato o aggiornato
  useEffect(() => {
    let isMounted = true;
    let currentBlobUrl = null;

    const loadLogo = async () => {
      // Revoca URL precedente
      setLogoSource(prevUrl => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });

      if (club?.logoId) {
        // Nuovo formato: carica il logo tramite API
        setLoadingLogo(true);
        try {
          const blob = await getBlobDocumento(club.logoId);
          
          if (blob && isMounted) {
            currentBlobUrl = URL.createObjectURL(blob);
            setLogoSource(currentBlobUrl);
          } else {
            if (isMounted) {
              setLogoSource(null);
            }
          }
        } catch (error) {
          console.error('Errore caricamento logo:', error);
          if (isMounted) {
            setLogoSource(null);
          }
        } finally {
          if (isMounted) {
            setLoadingLogo(false);
          }
        }
      } else {
        // Nessun logoId, mostra subito il logo di default
        setLoadingLogo(false);
        setLogoSource(null);
      }
    };

    loadLogo();

    // Cleanup: revoca l'URL del blob quando cambia logoId o componente viene smontato
    return () => {
      isMounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [club?.logoId, club?.logo]);

  const handleEditClick = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditSubmit = async (formData) => {
    const { logo, logoType, ...sendData } = formData;
    try {
      const updated = await updateClub(club.id, sendData);
      setClub(updated);
      handleEditClose();
    } catch (error) {
      throw error;
    }
  };

  const handleLogoEditClick = () => {
    setLogoModalOpen(true);
  };

  const handleLogoModalClose = () => {
    setLogoModalOpen(false);
  };

  const handleLogoUpdateComplete = async (updated) => {
    // Aggiorna i dati del club con il nuovo logoId
    setClub(updated);
    setLogoModalOpen(false);
  };

  const getLogoSrc = () => {
    // Se abbiamo il logoSource (caricato dal blob), usalo
    if (logoSource) {
      return logoSource;
    }
    // Altrimenti usa il logo di default
    return '/logo_ufficiale.png';
  };

  if (!club) {
    return <Typography>Caricamento dati club...</Typography>;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Gestione Club"
        icon={FaUniversity}
      />

      {/* Contenuto della pagina */}
      <div className="page-content">
        <div className="page-card">
          <div className="page-card-body">

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box sx={{ position: 'relative', minWidth: 140 }}>
                {loadingLogo ? (
                  <Box 
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px solid #e0e0e0',
                      borderRadius: '50%',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Avatar
                    src={getLogoSrc()}
                    alt="Logo Club"
                    sx={{ width: 200, height: 200}}
                  />
                )}
                <Tooltip title="Modifica logo">
                  <IconButton
                    sx={{ position: 'absolute', bottom: 1, right: 3 }}
                    onClick={handleLogoEditClick}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{club.denominazione}</Typography>
                  <Tooltip title="Modifica dati club">
                    <IconButton onClick={handleEditClick}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={32}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="primary" />
                      <Typography>{club.email || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <PhoneIcon color="primary" />
                      <Typography>{club.recapitoTelefonico || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LocationOnIcon color="primary" />
                      <Typography>{club.indirizzo || '-'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Typography>Rappresentante: {club.legaleRappresentante || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <BadgeIcon color="primary" />
                      <Typography>Direttore Tecnico: {club.direttoreTecnico || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <BusinessIcon color="primary" />
                      <Typography>Partita IVA: {club.partitaIva || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <BusinessIcon color="primary" />
                      <Typography>Codice Fiscale: {club.codiceFiscale || '-'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </div>
        </div>
      </div>

      {/* Modale modifica dati club */}
      <ClubModal
        open={editOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        club={club}
        isEditMode={true}
      />
      {/* Modale upload logo */}
      <LogoUploadModal
        open={logoModalOpen}
        onClose={handleLogoModalClose}
        club={club}
        onSuccess={handleLogoUpdateComplete}
      />
    </div>
  );
};

// Componente LogoUploadModal per l'upload del logo del club
const LogoUploadModal = ({ open, onClose, club, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verifica dimensione (max 2MB)
      if (file.size > MAX_LOGO_SIZE) {
        setError('Il file è troppo grande. Dimensione massima: 2MB');
        return;
      }

      // Verifica tipo file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Formato non supportato. Sono accettati solo immagini JPG e PNG');
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
      const updated = await uploadLogoClub(club.id, selectedFile);
      setSuccess('Logo caricato con successo!');
      setSelectedFile(null);
      
      // Chiama la callback di successo dopo 1.5 secondi
      setTimeout(() => {
        if (onSuccess) onSuccess(updated);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il caricamento del logo');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Carica nuovo logo
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
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Seleziona il logo del club
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Seleziona immagine
              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png"
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
              Formati accettati: JPG, PNG (max 2MB)
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

export default ClubUser;