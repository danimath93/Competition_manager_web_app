import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
  Tooltip,
  Dialog
} from '@mui/material';
import { EditDocument, Notes, Delete, AppRegistration, Description, ManageAccounts, EmojiEvents } from '@mui/icons-material';
import { FaCalendar, FaTags } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { format } from 'date-fns';
import { CompetitionStatus } from '../constants/enums/CompetitionEnums';
import { getCompetitionStatusColor } from '../utils/helperCompetitions';
import AuthComponent from './AuthComponent';
import { getBlobDocumento } from '../api/documents';

const CompetitionCard = ({ competition, onRegister, onEdit, onDelete, onDetails, onSummary, onEditClubOrganizer, onDocuments, onCategories, onResults, userClubId }) => {
  const isRegistrationOpen = (competition.stato === CompetitionStatus.OPEN) && 
    (new Date(competition.dataFine) >= new Date()) && 
    (new Date(competition.dataScadenzaIscrizioni) >= new Date());
  const isClubRegistered = competition?.clubIscritti?.includes(userClubId) || false;
  const [locandinaUrl, setLocandinaUrl] = useState(null);
  const [isLocandinaOpen, setIsLocandinaOpen] = useState(false);

  // Carica la locandina della competizione (se presente)
  useEffect(() => {
    let isMounted = true;
    let currentBlobUrl = null;

    const loadLocandina = async () => {
      setLocandinaUrl(null);
      if (!competition.locandinaId) return;

      try {
        const blob = await getBlobDocumento(competition.locandinaId);
        if (blob && isMounted) {
          currentBlobUrl = URL.createObjectURL(blob);
          setLocandinaUrl(currentBlobUrl);
        }
      } catch (error) {
        console.error('Errore nel caricamento della locandina:', error);
      }
    };

    loadLocandina();

    return () => {
      isMounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [competition.locandinaId]);

  const checkCompetitionStatus = (enabledStatuses) => {
    return enabledStatuses.includes(competition.stato);
  }

  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between', 
      mb: 2 
    }}>
      {locandinaUrl && (
        <CardMedia
          component="img"
          image={locandinaUrl}
          alt={`Locandina ${competition.nome}`}
          onClick={() => setIsLocandinaOpen(true)}
          sx={{
            width: { xs: '100%', md: 160 },
            maxHeight: { xs: 240, md: 220 },
            objectFit: 'contain',
            alignSelf: { xs: 'stretch', md: 'center' },
            bgcolor: 'grey.100',
            cursor: 'zoom-in',
            flexShrink: 0
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" component="div">
          {competition.nome}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaCalendar style={{ fontSize: '0.8rem', color: 'text.secondary' }} />
          <Typography color="text.secondary" variant="body2">
            {format(new Date(competition.dataInizio), 'dd/MM/yyyy')} - {format(new Date(competition.dataFine), 'dd/MM/yyyy')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaLocationDot style={{ fontSize: '1.0rem', color: 'text.secondary' }} />
          <Typography variant="h5">
            {competition.luogo}
          </Typography>
        </Box>

        <Box>
          <Chip label={"Stato: " + competition.stato.toUpperCase()} color={getCompetitionStatusColor(competition.stato)} size="small" />
          {isClubRegistered && (
            <Chip label="Iscritto" color="primary" size="small" sx={{ ml: 1 }} />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: { xs: 'flex-start', md: 'center' },
        alignItems: { xs: 'stretch', md: 'center' },
        p: 2, pt: 0, ml: 'auto'
      }}>
          <Box sx={{ ml: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
            {/* Selezione specifica per club organizzatore: */}
            {competition.organizzatoreClubId === userClubId && (
              <AuthComponent requiredRoles={['club']}>
                <Tooltip title="Definisci Competizione" arrow>
                  <Button
                    color='primary'
                    variant="contained"
                    onClick={() => onEdit(competition)}
                  >
                    <EditDocument />
                  </Button>
                </Tooltip>
                <Tooltip title="Riepilogo Iscrizioni" arrow>
                  <Button
                    color='primary'
                    variant="contained"
                    onClick={() => onSummary(competition.id)}
                  >
                    <Notes />
                  </Button>
                </Tooltip>
              </AuthComponent>
            )}
            {/* Selezione solo per Admin o SuperAdmin */}
            <AuthComponent requiredRoles={['admin', 'superAdmin']}>
              <Tooltip title="Definisci Competizione" arrow>
                <Button
                  color='primary'
                  variant="contained"
                  onClick={() => onEdit(competition)}
                >
                  <EditDocument />
                </Button>
              </Tooltip>
              <Tooltip title="Riepilogo Iscrizioni" arrow>
                <Button
                  color='primary'
                  variant="contained"
                  onClick={() => onSummary(competition.id)}
                >
                  <Notes />
                </Button>
              </Tooltip>
              <Tooltip title="Assegna Competizione" arrow>
                <Button
                  color='error'
                  variant="contained"
                  onClick={() => onEditClubOrganizer(competition.id)}
                >
                  <ManageAccounts />
                </Button>
              </Tooltip>
              <Tooltip title="Elimina Competizione" arrow>
                <Button
                  color='error'
                  variant="contained"
                  onClick={() => onDelete(competition.id)}
                >
                  <Delete />
                </Button>
              </Tooltip>
            </AuthComponent>
          </Box>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
            <AuthComponent requiredRoles={['admin', 'superAdmin', 'club']}>
              <Tooltip title="Registra Atleti" arrow>
                <Button
                  variant="contained"
                  color='info'
                  onClick={() => onRegister(competition.id)}
                  disabled={!isRegistrationOpen}
                >
                  <AppRegistration />
                </Button>
              </Tooltip>
            </AuthComponent>
            <Tooltip title="Visualizza documenti competizione" arrow>
              <Button
                variant="contained"
                color='info'
                onClick={() => onDocuments(competition)}
                disabled={!checkCompetitionStatus([CompetitionStatus.OPEN, CompetitionStatus.IN_PREPARATION, CompetitionStatus.ONGOING])}
              >
                <Description />
              </Button>
            </Tooltip>
            <Tooltip title="Visualizza categorie iscritti" arrow>
              <Button
                variant="contained"
                color='info'
                onClick={() => onCategories(competition.id)}
                disabled={!checkCompetitionStatus([CompetitionStatus.IN_PREPARATION, CompetitionStatus.ONGOING, CompetitionStatus.COMPLETED])}
              >
                <FaTags size={24} />
              </Button>
            </Tooltip>
            <Tooltip title="Visualizza risultati competizione" arrow>
              <Button
                variant="contained"
                color='info'
                onClick={() => onResults(competition.id)}
                disabled={!checkCompetitionStatus([CompetitionStatus.ONGOING, CompetitionStatus.COMPLETED])}
              >
                <EmojiEvents size={24} />
              </Button>
            </Tooltip>
          </Box>
      </CardActions>

      {locandinaUrl && (
        <Dialog open={isLocandinaOpen} onClose={() => setIsLocandinaOpen(false)} maxWidth="md">
          <Box
            component="img"
            src={locandinaUrl}
            alt={`Locandina ${competition.nome}`}
            onClick={() => setIsLocandinaOpen(false)}
            sx={{ display: 'block', maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', cursor: 'zoom-out' }}
          />
        </Dialog>
      )}
    </Card>
  );
};

export default CompetitionCard;
