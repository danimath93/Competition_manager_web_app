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
} from '@mui/material';
import { Edit, Delete, AppRegistration, Description, ManageAccounts, InfoOutline } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { CompetitionStatus } from '../constants/enums/CompetitionEnums';

const CompetitionCard = ({ competition, onRegister, onEdit, onDelete, onDetails, onEditClubOrganizer, onDocuments }) => {
  const { user } = useAuth();

  const isActive = (competition.stato === CompetitionStatus.OPEN) && (new Date(competition.dataFine) >= new Date());
  const isClubRegistered = competition?.clubIscritti?.includes(user.clubId) || false;

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
          <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
            {user && (user.permissions === 'admin' || user.permissions === 'superAdmin' || user.clubId === competition.organizzatoreClubId) && (
              // Mostra il bottone modifica se club Organizzatore oppure Admin
              <IconButton
                variant="contained"
                size="small"
                onClick={() => onEdit(competition)}
              >
                <Edit />
              </IconButton>
            )}
            {user && (user.permissions === 'admin' || user.permissions === 'superAdmin') && (
              // Mostra il bottone selezione club Organizzatore solo se Admin
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={() => onEditClubOrganizer(competition.id)}
              >
                <ManageAccounts />
              </IconButton>
            )}
            {user && (user.permissions === 'admin' || user.permissions === 'superAdmin') && (
              // Mostra il bottone eliminazione completa gara solo se Admin
              <IconButton
                variant="contained"
                color="error"
                size="small"
                onClick={() => onDelete(competition.id)}
              >
                <Delete />
              </IconButton>
            )}
          </Box>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
            {user && (user.permissions === 'admin' || user.permissions === 'superAdmin' || user.permissions === 'club') && (
              <Button
                variant="contained"
                onClick={() => onRegister(competition.id)}
                disabled={!isActive}
              >
                <AppRegistration />
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => onDetails(competition)}
            >
              <InfoOutline />
            </Button>
            <Button
              variant="contained"
              onClick={() => onDocuments(competition)}
              disabled={!isActive}
            >
              <Description />
            </Button>
          </Box>
        </>
      </CardActions>
    </Card>
  );
};

export default CompetitionCard;
