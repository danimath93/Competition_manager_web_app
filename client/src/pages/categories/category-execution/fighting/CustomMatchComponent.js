// CustomMatchComponent.js
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

/**
 * Componente personalizzato per visualizzare un match nel tabellone
 * con possibilità di inserire i punteggi
 */
const CustomMatchComponent = ({
  match,
  onMatchClick,
  onPartyClick,
  onMouseEnter,
  onMouseLeave,
  topParty,
  bottomParty,
  topWon,
  bottomWon,
  topHovered,
  bottomHovered,
  topText,
  bottomText,
  connectorColor,
  computedStyles,
  teamNameFallback,
  resultFallback,
  // Props custom
  onScoreChange,
  stato,
  isEditable = false
}) => {
  const handleScoreChange = (partyId, value) => {
    if (onScoreChange) {
      onScoreChange(match.id, partyId, value);
    }
  };

  return (
    <Box
      onClick={() => onMatchClick?.(match)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: onMatchClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main'
        }
      }}
    >
      {/* Top Player */}
      <Box
        onMouseEnter={() => onMouseEnter?.(topParty.id)}
        onMouseLeave={() => onMouseLeave?.()}
        onClick={() => onPartyClick?.(topParty)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          bgcolor: topWon ? 'success.light' : topHovered ? 'action.hover' : 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 40
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: topWon ? 'bold' : 'normal',
              color: topWon ? 'success.dark' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {topParty?.name || teamNameFallback}
          </Typography>
          {topParty?.picture && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontStyle: 'italic'
              }}
            >
              {topParty.picture}
            </Typography>
          )}
        </Box>
        
        {isEditable && topParty?.id && topParty.id !== 'TBD-1' && topParty.id !== 'TBD-2' ? (
          <TextField
            type="number"
            size="small"
            value={topParty?.resultText || ''}
            onChange={(e) => handleScoreChange(topParty.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: 60,
              ml: 1,
              '& input': {
                textAlign: 'center',
                p: 0.5
              }
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: topWon ? 'success.dark' : 'text.secondary',
              ml: 1,
              minWidth: 30,
              textAlign: 'center'
            }}
          >
            {topParty?.resultText || '-'}
          </Typography>
        )}
      </Box>

      {/* Bottom Player */}
      <Box
        onMouseEnter={() => onMouseEnter?.(bottomParty.id)}
        onMouseLeave={() => onMouseLeave?.()}
        onClick={() => onPartyClick?.(bottomParty)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          bgcolor: bottomWon ? 'success.light' : bottomHovered ? 'action.hover' : 'background.paper',
          minHeight: 40
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: bottomWon ? 'bold' : 'normal',
              color: bottomWon ? 'success.dark' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {bottomParty?.name || teamNameFallback}
          </Typography>
          {bottomParty?.picture && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontStyle: 'italic'
              }}
            >
              {bottomParty.picture}
            </Typography>
          )}
        </Box>
        
        {isEditable && bottomParty?.id && bottomParty.id !== 'TBD-1' && bottomParty.id !== 'TBD-2' ? (
          <TextField
            type="number"
            size="small"
            value={bottomParty?.resultText || ''}
            onChange={(e) => handleScoreChange(bottomParty.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: 60,
              ml: 1,
              '& input': {
                textAlign: 'center',
                p: 0.5
              }
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: bottomWon ? 'success.dark' : 'text.secondary',
              ml: 1,
              minWidth: 30,
              textAlign: 'center'
            }}
          >
            {bottomParty?.resultText || '-'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CustomMatchComponent;
