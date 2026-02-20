// MatchComponent.js
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

/**
 * Componente personalizzato per visualizzare un match nel tabellone
 * con caselle rosse/blu per gli atleti e indicatori round
 */
const MatchComponent = ({
  match,
  atleta1 = null,
  atleta2 = null,
  roundIndex = 0,
  isEditable = false,
  onAtletaClick,
  onRoundClick,
  onWinnerClick,
  onRemoveAtleta
}) => {
  // Funzione per ottenere il colore di un round indicator
  const getRoundColor = (roundResult) => {
    if (roundResult === 'red') return '#f44336';
    if (roundResult === 'blue') return '#2196f3';
    if (roundResult === 'yellow') return '#ffc107';
    return '#e0e0e0'; // default gray
  };

  // Calcola il vincitore in base ai round
  // Un atleta deve vincere ALMENO 2 round per essere dichiarato vincitore automatico
  const calculateWinner = () => {
    if (!match?.roundResults) return null;
    const redWins = match.roundResults.filter(r => r === 'red').length;
    const blueWins = match.roundResults.filter(r => r === 'blue').length;
    
    // Richiede almeno 2 vittorie per vincere automaticamente
    if (redWins >= 2) return match.players[0];
    if (blueWins >= 2) return match.players[1];
    return null; // Parità o non determinato
  };

  // Determina il colore del vincitore (rosso o blu)
  const getWinnerColor = () => {
    const winnerId = match?.winner || calculateWinner();
    if (!winnerId) return null;
    
    if (winnerId === match?.players[0]) return 'red';
    if (winnerId === match?.players[1]) return 'blue';
    return null;
  };

  // Controlla se il match è in parità e richiede selezione manuale
  const isDrawRequiringManualSelection = () => {
    if (!match?.roundResults || match?.winner) return false;
    const redWins = match.roundResults.filter(r => r === 'red').length;
    const blueWins = match.roundResults.filter(r => r === 'blue').length;
    const nullCount = match.roundResults.filter(r => r === null).length;
    
    // Se tutti e 3 i round sono assegnati ma nessuno ha 2 vittorie
    if (nullCount === 0 && redWins < 2 && blueWins < 2) return true;
    return false;
  };

  const winnerColor = getWinnerColor();
  const needsManualSelection = isDrawRequiringManualSelection();

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
        onClick={() => isEditable && !atleta1 && onAtletaClick && onAtletaClick(match?.id, 'red')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: winnerColor === 'red' ? '#ffcdd2' : atleta1 ? '#ffebee' : '#f5f5f5',
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
              fontWeight: winnerColor === 'red' ? 'bold' : 'normal',
              color: atleta1 ? 'text.primary' : 'text.secondary',
              fontStyle: !atleta1 ? 'italic' : 'normal'
            }}
          >
            {atleta1 ? `${atleta1.cognome} ${atleta1.nome}` : (atleta2 && roundIndex === 0 ? 'BYE' : 'Clicca per selezionare')}
          </Typography>
          {atleta1 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {atleta1.club?.abbreviazione || atleta1.club?.denominazione || '-'} • {atleta1.peso || '-'} kg
            </Typography>
          )}
        </Box>
        {isEditable && atleta1 && onRemoveAtleta && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveAtleta(match?.id, 'red');
            }}
            sx={{
              color: '#d32f2f',
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.1)'
              }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
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
            bgcolor: winnerColor === 'red' ? '#f44336' : winnerColor === 'blue' ? '#2196f3' : needsManualSelection ? '#ff9800' : '#e0e0e0',
            border: '3px solid',
            borderColor: winnerColor ? '#fff' : needsManualSelection ? '#ff6f00' : 'grey.400',
            ml: 1,
            cursor: isEditable ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: winnerColor ? 3 : needsManualSelection ? 2 : 0,
            transition: 'all 0.2s',
            animation: needsManualSelection ? 'pulse 1.5s infinite' : 'none',
            '&:hover': isEditable ? {
              transform: 'scale(1.15)',
              boxShadow: 4
            } : {},
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.6 },
              '100%': { opacity: 1 }
            }
          }}
        >
          {winnerColor ? (
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
              W
            </Typography>
          ) : needsManualSelection ? (
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.65rem' }}>
              !
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Atleta 2 (Blu) */}
      <Box
        onClick={() => isEditable && !atleta2 && onAtletaClick && onAtletaClick(match?.id, 'blue')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: winnerColor === 'blue' ? '#bbdefb' : atleta2 ? '#e3f2fd' : '#f5f5f5',
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
              fontWeight: winnerColor === 'blue' ? 'bold' : 'normal',
              color: atleta2 ? 'text.primary' : 'text.secondary',
              fontStyle: !atleta2 ? 'italic' : 'normal'
            }}
          >
            {atleta2 ? `${atleta2.cognome} ${atleta2.nome}` : (atleta1 && roundIndex === 0 ? 'BYE' : 'Clicca per selezionare')}
          </Typography>
          {atleta2 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {atleta2.club?.abbreviazione || atleta2.club?.denominazione || '-'} • {atleta2.peso || '-'} kg
            </Typography>
          )}
        </Box>
        {isEditable && atleta2 && onRemoveAtleta && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveAtleta(match?.id, 'blue');
            }}
            sx={{
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default MatchComponent;
