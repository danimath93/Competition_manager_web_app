import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Button,
  Box,
  Chip,
  Tooltip
} from '@mui/material';
import { EditDocument, Notes, Delete, AppRegistration, Description, ManageAccounts, InfoOutline } from '@mui/icons-material';
import { format } from 'date-fns';
import { CompetitionStatus } from '../constants/enums/CompetitionEnums';
import AuthComponent from './AuthComponent';

const CompetitionCard = ({ competition, onRegister, onEdit, onDelete, onDetails, onSummary, onEditClubOrganizer, onDocuments, userClubId }) => {
  const isActive = (competition.stato === CompetitionStatus.OPEN) && (new Date(competition.dataFine) >= new Date());
  const isClubRegistered = competition?.clubIscritti?.includes(userClubId) || false;

  const getStatusColor = (status) => {
    switch (status) {
      case CompetitionStatus.PLANNED:
        return 'default';
      case CompetitionStatus.IN_PREPARATION:
        return 'info';
      case CompetitionStatus.OPEN:
        return 'primary';
      case CompetitionStatus.ONGOING:
        return 'warning';
      case CompetitionStatus.COMPLETED:
        return 'success';
      case CompetitionStatus.CANCELLED:
        return 'error';
    }
  }

  return (
    <Card sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div">
          {competition.nome}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {format(new Date(competition.dataInizio), 'dd/MM/yyyy')} - {format(new Date(competition.dataFine), 'dd/MM/yyyy')}
        </Typography>
        <Typography variant="body2">
          {competition.luogo}
        </Typography>

        <Box sx={{ mt: 1 }}>
          <Chip label={competition.stato} color={getStatusColor(competition.stato)} size="small" />
          {isClubRegistered && (
            <Chip label="Iscritto" color="primary" size="small" sx={{ ml: 1 }} />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
        <>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
            {/* Selezione specifica per club organizzatore: */}
            {competition.organizzatoreClubId === userClubId && (
              <AuthComponent requiredRoles={['club']}>
                <Tooltip title="Definisci Competizione" arrow>
                  <Button
                    color='secondary'
                    variant="contained"
                    onClick={() => onEdit(competition)}
                  >
                    <EditDocument />
                  </Button>
                </Tooltip>
                <Tooltip title="Riepilogo Iscrizioni" arrow>
                  <Button
                    color='secondary'
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
                  color='secondary'
                  variant="contained"
                  onClick={() => onEdit(competition)}
                >
                  <EditDocument />
                </Button>
              </Tooltip>
              <Tooltip title="Riepilogo Iscrizioni" arrow>
                <Button
                  color='secondary'
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
                  onClick={() => onRegister(competition.id)}
                  disabled={!isActive}
                >
                  <AppRegistration />
                </Button>
              </Tooltip>
            </AuthComponent>
            <Tooltip title="Dettagli Competizione" arrow>
              <Button
                variant="contained"
                onClick={() => onDetails(competition)}
              >
                <InfoOutline />
              </Button>
            </Tooltip>
            <Tooltip title="Inserisci Documenti Competizione" arrow>
              <Button
                variant="contained"
                onClick={() => onDocuments(competition)}
                disabled={!isActive}
              >
                <Description />
              </Button>
            </Tooltip>
          </Box>
        </>
      </CardActions>
    </Card>
  );
};

export default CompetitionCard;
