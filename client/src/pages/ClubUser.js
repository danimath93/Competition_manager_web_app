import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  TextField,
  Tooltip,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import ClubModal from '../components/ClubModal';
import { useAuth } from '../context/AuthContext';
import { loadClubByID, updateClub, uploadLogoClub } from '../api/clubs';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const ClubUser = () => {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState('');
  const [loadingLogo, setLoadingLogo] = useState(false);

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

  const handleEditClick = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditSubmit = async (formData) => {
    try {
      const updated = await updateClub(club.id, formData);
      setClub(updated);
      setEditOpen(false);
    } catch (error) {
      alert('Errore durante l\'aggiornamento del club.');
    }
  };

  const handleLogoEditClick = () => {
    setLogoModalOpen(true);
    setLogoFile(null);
    setLogoError('');
  };

  const handleLogoModalClose = () => {
    setLogoModalOpen(false);
    setLogoFile(null);
    setLogoError('');
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setLogoError('Il file deve essere JPEG o PNG.');
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError('Il file deve essere massimo 2MB.');
      return;
    }
    setLogoFile(file);
    setLogoError('');
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      setLogoError('Seleziona un file.');
      return;
    }
    setLoadingLogo(true);
    try {
      const updated = await uploadLogoClub(club.id, logoFile);
      setClub(updated);
      setLogoModalOpen(false);
    } catch (error) {
      setLogoError('Errore durante l\'upload del logo.');
    }
    setLoadingLogo(false);
  };

  const getLogoSrc = () => {
    if (club && club.logo) {
      if (typeof club.logo === 'string') return club.logo;
      // Se logo è un array di byte (buffer), convertirlo in base64 compatibile browser
      if (club.logo.data && Array.isArray(club.logo.data)) {
        const byteArray = new Uint8Array(club.logo.data);
        let binary = '';
        for (let i = 0; i < byteArray.length; i++) {
          binary += String.fromCharCode(byteArray[i]);
        }
        const base64 = window.btoa(binary);
        // Usa il tipo corretto se disponibile
        const mimeType = club.logoType || 'image/png';
        return `data:${mimeType};base64,${base64}`;
      }
    }
    return '/logo_ufficiale.png';
  };

  if (!club) {
    return <Typography>Caricamento dati club...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card sx={{ p: 3, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ position: 'relative', minWidth: 140 }}>
            <Avatar
              src={getLogoSrc()}
              alt="Logo Club"
              sx={{ width: 140, height: 140, border: '3px solid #1976d2', bgcolor: '#fff' }}
            />
            <Tooltip title="Modifica logo">
              <IconButton
                sx={{ position: 'absolute', bottom: 1, right: 3, bgcolor: '#1976d2', color: '#fff', zIndex: 2 }}
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
                <IconButton onClick={handleEditClick} sx={{ bgcolor: '#1976d2', color: '#fff' }}>
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
      </Card>
      {/* Modale modifica dati club */}
      <ClubModal
        open={editOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        club={club}
        isEditMode={true}
      />
      {/* Modale upload logo */}
      <Modal open={logoModalOpen} onClose={handleLogoModalClose}>
        <Box sx={{ ...styleModal, width: 400 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Carica nuovo logo</Typography>
          <form onSubmit={handleLogoUpload}>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleLogoFileChange}
              style={{ marginBottom: 16 }}
            />
            {logoError && <Typography color="error" sx={{ mb: 1 }}>{logoError}</Typography>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleLogoModalClose}>Annulla</Button>
              <Button type="submit" variant="contained" disabled={loadingLogo}>
                {loadingLogo ? 'Caricamento...' : 'Salva'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Container>
  );
};

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #1976d2',
  boxShadow: 24,
  p: 4,
};

export default ClubUser;