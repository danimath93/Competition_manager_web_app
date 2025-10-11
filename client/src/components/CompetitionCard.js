import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Edit, Delete, Info, AppRegistration } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const CompetitionCard = ({ competition, onRegister, onEdit, onDelete, onDetails }) => {
  const { user } = useAuth();

  const isUserRegistered = competition.isRegistered;
  const isActive = new Date(competition.data_fine) >= new Date();

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
            {isActive ? (
                <Chip label="Attiva" color="success" size="small" />
            ) : (
                <Chip label="Conclusa" color="default" size="small" />
            )}
            {isUserRegistered && (
                <Chip label="Iscritto" color="primary" size="small" sx={{ ml: 1 }} />
            )}
        </Box>
      </CardContent>
      <CardActions sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
        {user && (user.permissions === 'admin' || user.permissions === 'superAdmin') ? (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Info />}
              onClick={() => onDetails(competition)}
              sx={{ mb: 1, width: '100%' }}
            >
              Dettagli
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Edit />}
              onClick={() => onEdit(competition)}
              sx={{ mb: 1, width: '100%' }}
            >
              Modifica
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={() => onDelete(competition.id)}
              sx={{ width: '100%' }}
            >
              Elimina
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<AppRegistration />}
            onClick={() => onRegister(competition.id)}
            disabled={!isActive && !isUserRegistered}
          >
            {isUserRegistered ? 'Modifica Iscrizione' : 'Iscriviti'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default CompetitionCard;
