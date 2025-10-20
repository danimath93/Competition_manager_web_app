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
import { Edit, Delete, Info, AppRegistration, Description } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { CompetitionStatus } from '../constants/enums/CompetitionEnums';

const CompetitionCard = ({ competition, onRegister, onEdit, onDelete, onDetails }) => {
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
          {user && (user.permissions === 'admin' || user.permissions === 'superAdmin') && (
            // Mostra i bottoni di modifica e cancellazione solo per admin e superAdmin, in un box orizzontale
            <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
              <IconButton
                variant="outlined"
                size="small"
                onClick={() => onDetails(competition)}
              >
                <Info />
              </IconButton>
              <IconButton
                variant="contained"
                size="small"
                onClick={() => onEdit(competition)}
              >
                <Edit />
              </IconButton>
              <IconButton
                variant="contained"
                color="error"
                size="small"
                onClick={() => onDelete(competition.id)}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
          {user && (user.permissions === 'admin' || user.permissions === 'superAdmin' || user.permissions === 'club') && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => onRegister(competition.id)}
                disabled={!isActive}
              >
                <AppRegistration />
              </Button>
              <Button
                variant="contained"
                onClick={() => onRegister(competition.id)}
                disabled={!isActive}
              >
                <Description />
              </Button>
            </Box>
          )}
        </>
      </CardActions>
    </Card>
  );
};

export default CompetitionCard;
