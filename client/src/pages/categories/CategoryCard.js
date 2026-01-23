import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
  Tooltip
} from '@mui/material';
import { Category, PlayArrow, EmojiEvents } from '@mui/icons-material';
import { FaCalendar, FaUniversity } from 'react-icons/fa';
import { format } from 'date-fns';
import { getCompetitionStatusColor } from '../../utils/helperCompetitions';

const CategoryCard = ({ competition, onDefinition, onExecution, onCheckResults }) => {
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between', 
      mb: 2 
    }}>
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
          <FaUniversity style={{ fontSize: '1.0rem', color: 'text.secondary' }} />
          <Typography variant="h5">
            Organizzatore: {competition?.organizzatore?.denominazione}
          </Typography>
        </Box>

        <Box>
          <Chip label={"Stato: " + competition.stato.toUpperCase()} color={getCompetitionStatusColor(competition.stato)} size="small" />
        </Box>
      </CardContent>
      <CardActions sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: { xs: 'flex-start', md: 'center' },
        alignItems: { xs: 'stretch', md: 'center' },
        p: 2, pt: 0, ml: 'auto'
      }}>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Tooltip title="Definisci categorie" arrow>
              <Button
                variant="contained"
                color='info'
                onClick={() => onDefinition(competition.id)}
              >
                <Category />
              </Button>
            </Tooltip>
            <Tooltip title="Svolgimento categorie" arrow>
              <Button
                variant="contained"
                color='info'
                onClick={() => onExecution(competition.id)}
              >
                <PlayArrow />
              </Button>
            </Tooltip>
            <Tooltip title="Risultati categorie" arrow>
              <Button
                variant="contained"
                color='info'
                onClick={() => onCheckResults(competition.id)}
              >
                <EmojiEvents />
              </Button>
            </Tooltip>
          </Box>
      </CardActions>
    </Card>
  );
}

export default CategoryCard;