// MatchComponent.js
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';

/**
 * Componente personalizzato per visualizzare un match nel tabellone
 * con caselle rosse/blu per gli atleti e indicatori round
 */
const MatchComponent = ({
  match,
  atleta1 = null,
  atleta2 = null,
  isEditable = false,
  onAtletaClick,
  onRoundClick,
  onWinnerClick
}) => {
  // Funzione per ottenere il colore di un round indicator
  const getRoundColor = (roundResult) => {
    if (roundResult === 'red') return '#f44336';
    if (roundResult === 'blue') return '#2196f3';
    if (roundResult === 'yellow') return '#ffc107';
    return '#e0e0e0'; // default gray
  };

  // Calcola il vincitore in base ai round
  const calculateWinner = () => {
    if (!match?.roundResults) return null;
    const redWins = match.roundResults.filter(r => r === 'red').length;
    const blueWins = match.roundResults.filter(r => r === 'blue').length;
    if (redWins > blueWins) return 'red';
    if (blueWins > redWins) return 'blue';
    return null; // Parità o non determinato
  };

  const winner = match?.winner || calculateWinner();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1
      }}
    >
      {/* Atleta 1 (Rosso) */}
      <Box
        onClick={() => isEditable && onAtletaClick && onAtletaClick(match?.id, 'red')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: winner === 'red' ? '#ffcdd2' : '#ffebee',
          borderBottom: '2px solid #f44336',
          borderLeft: '6px solid #f44336',
          cursor: isEditable && !atleta1 ? 'pointer' : 'default',
          minHeight: 50,
          transition: 'all 0.2s',
          '&:hover': isEditable && !atleta1 ? {
            bgcolor: '#ffcccc'
          } : {}
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: winner === 'red' ? 'bold' : 'normal',
              color: 'text.primary'
            }}
          >
            {atleta1 ? `${atleta1.cognome} ${atleta1.nome}` : 'Clicca per selezionare'}
          </Typography>
          {atleta1 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {atleta1.club?.denominazione || '-'} • {atleta1.peso || '-'} kg
            </Typography>
          )}
        </Box>
      </Box>

      {/* Round Indicators */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 1.5,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* 3 round indicators */}
        {[0, 1, 2].map((idx) => (
          <Box
            key={idx}
            onClick={() => isEditable && onRoundClick && onRoundClick(match?.id, idx)}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: getRoundColor(match?.roundResults?.[idx]),
              border: '2px solid',
              borderColor: 'grey.400',
              cursor: isEditable ? 'pointer' : 'default',
              transition: 'all 0.2s',
              '&:hover': isEditable ? {
                transform: 'scale(1.15)',
                boxShadow: 2
              } : {}
            }}
          />
        ))}

        {/* Winner indicator (larger) */}
        <Box
          onClick={() => isEditable && onWinnerClick && onWinnerClick(match?.id)}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: winner === 'red' ? '#f44336' : winner === 'blue' ? '#2196f3' : '#e0e0e0',
            border: '3px solid',
            borderColor: winner ? '#fff' : 'grey.400',
            ml: 1,
            cursor: isEditable ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: winner ? 3 : 0,
            transition: 'all 0.2s',
            '&:hover': isEditable ? {
              transform: 'scale(1.15)',
              boxShadow: 4
            } : {}
          }}
        >
          {winner && (
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
              W
            </Typography>
          )}
        </Box>
      </Box>

      {/* Atleta 2 (Blu) */}
      <Box
        onClick={() => isEditable && onAtletaClick && onAtletaClick(match?.id, 'blue')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: winner === 'blue' ? '#bbdefb' : '#e3f2fd',
          borderTop: '2px solid #2196f3',
          borderLeft: '6px solid #2196f3',
          cursor: isEditable && !atleta2 ? 'pointer' : 'default',
          minHeight: 50,
          transition: 'all 0.2s',
          '&:hover': isEditable && !atleta2 ? {
            bgcolor: '#b3d9ff'
          } : {}
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: winner === 'blue' ? 'bold' : 'normal',
              color: 'text.primary'
            }}
          >
            {atleta2 ? `${atleta2.cognome} ${atleta2.nome}` : 'Clicca per selezionare'}
          </Typography>
          {atleta2 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {atleta2.club?.denominazione || '-'} • {atleta2.peso || '-'} kg
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MatchComponent;
