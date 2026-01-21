import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Alert,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { CloudUpload, Close } from '@mui/icons-material';
import { FaUniversity } from 'react-icons/fa';
import ClubModal from '../../components/ClubModal';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { loadClubByID, updateClub, uploadLogoClub } from '../../api/clubs';
import { getBlobDocumento } from '../../api/documents';

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
    return (
      <div className="page-container">
        <PageHeader
          title="Gestione Club"
          icon={FaUniversity}
        />
        <div className="page-content">
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Gestione Club"
        icon={FaUniversity}
      />

      {/* Contenuto della pagina */}
      <div className="page-content">
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Card
            sx={{
              position: 'relative',
              overflow: 'visible',
              borderRadius: 1,
              boxShadow: 3,
            }}
          >
            {/* Immagine di copertina */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 150, sm: 200 },
                bgcolor: '#1a1a1a',
                backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                overflow: 'hidden',
                borderRadius: '8px 8px 0 0',
            }}
            >
              <CardMedia
                component="img"
                image="/assets/club-cover.jpg"
                alt="Club Cover"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.7,
                }}
                onError={(e) => {
                  // Se l'immagine non viene caricata, nascondi l'elemento img
                  e.target.style.display = 'none';
                }}
              />
            </Box>

            {/* Logo del club sovrapposto */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 90, sm: 120 },
                left: { xs: 20, sm: 30 },
                zIndex: 1,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                {loadingLogo ? (
                  <Box
                    sx={{
                      width: { xs: 100, sm: 140 },
                      height: { xs: 100, sm: 140 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid white',
                      borderRadius: '50%',
                      bgcolor: '#f5f5f5',
                      boxShadow: 3,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Avatar
                    src={getLogoSrc()}
                    alt="Logo Club"
                    sx={{
                      width: { xs: 100, sm: 140 },
                      height: { xs: 100, sm: 140 },
                      border: '4px solid white',
                      boxShadow: 3,
                    }}
                  />
                )}
                <Tooltip title="Modifica logo">
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      boxShadow: 2,
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      width: { xs: 30, sm: 36 },
                      height: { xs: 30, sm: 36 },
                    }}
                    onClick={handleLogoEditClick}
                    size="small"
                  >
                    <EditIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Contenuto della card */}
            <Box sx={{ pt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 3 }}>
              {/* Header con nome club e pulsante edit */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 3,
                  flexWrap: 'wrap',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  {club.denominazione}
                </Typography>
                <Tooltip title="Modifica dati club">
                  <IconButton
                    onClick={handleEditClick}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                    }}
                    size="small"
                  >
                    <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Lista informazioni */}
              <List sx={{ py: 0 }}>
                {/* Partita IVA */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <AccountBalanceIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Partita IVA: ${club.partitaIva || 'Non specificata'}`}
                    primaryTypographyProps={{
                      sx: { fontSize: { xs: '0.875rem', sm: '1rem' } },
                    }}
                  />
                </ListItem>

                {/* Codice Fiscale */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <AccountBalanceIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Codice Fiscale: ${club.codiceFiscale || 'Non specificato'}`}
                    primaryTypographyProps={{
                      sx: { fontSize: { xs: '0.875rem', sm: '1rem' } },
                    }}
                  />
                </ListItem>

                {/* Affiliazione */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <AccountBalanceIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Affiliazione: ${club.affiliazione || 'Non specificata'}`}
                    primaryTypographyProps={{
                      sx: { fontSize: { xs: '0.875rem', sm: '1rem' } },
                    }}
                  />
                </ListItem>

                {/* Indirizzo */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <LocationOnIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={club.indirizzo || 'Non specificato'}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        wordBreak: 'break-word',
                      },
                    }}
                  />
                </ListItem>

                {/* Email */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <EmailIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={club.email || 'Non specificata'}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        wordBreak: 'break-word',
                      },
                    }}
                  />
                </ListItem>

                {/* Telefono */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <PhoneIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={club.recapitoTelefonico || 'Non specificato'}
                    primaryTypographyProps={{
                      sx: { fontSize: { xs: '0.875rem', sm: '1rem' } },
                    }}
                  />
                </ListItem>

                {/* Rappresentante Legale */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <PersonIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Rappresentante: ${club.legaleRappresentante || 'Non specificato'}`}
                    primaryTypographyProps={{
                      sx: { fontSize: { xs: '0.875rem', sm: '1rem' } },
                    }}
                  />
                </ListItem>

                {/* Direttore Tecnico */}
                <ListItem
                  sx={{
                    px: 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <BadgeIcon color="secondary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Direttore Tecnico: ${club.direttoreTecnico || 'Non specificato'}`}
                    primaryTypographyProps={{
                      sx: { fontSize: { xs: '0.875rem', sm: '1rem' } },
                    }}
                  />
                </ListItem>

              </List>
            </Box>
          </Card>
        </Container>
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