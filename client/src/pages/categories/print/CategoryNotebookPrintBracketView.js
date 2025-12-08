import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

/**
 * Componente per visualizzare il tabellone di un torneo di combattimento
 * 
 * @param {Object} tabellone - Struttura JSON del tabellone con rounds e matches
 * @param {Array} athletes - Array di atleti per ottenere i nomi dai player IDs
 * @returns {JSX.Element}
 */
const CategoryNotebookPrintBracketView = ({ tabellone, athletes }) => {
  if (!tabellone || !tabellone.rounds || tabellone.rounds.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Nessun tabellone disponibile
        </Typography>
      </Box>
    );
  }

  // Funzione helper per ottenere il nome dell'atleta dall'ID
  const getAthleteName = (playerId) => {
    if (!playerId) return '';
    const athlete = athletes.find(a => a.id === playerId);
    if (!athlete) return `ID: ${playerId}`;
    return `${(athlete.cognome || '').toUpperCase()} ${
      (athlete.nome || '').charAt(0).toUpperCase() + (athlete.nome || '').slice(1).toLowerCase()
    }`;
  };

  // Funzione helper per ottenere il club dell'atleta
  const getAthleteClub = (playerId) => {
    if (!playerId) return '';
    const athlete = athletes.find(a => a.id === playerId);
    return athlete?.club?.denominazione || '';
  };

  const rounds = tabellone.rounds;

  // Calcola l'altezza di ogni match in base al round
  const getMatchHeight = (roundIndex) => {
    return 60 * Math.pow(2, roundIndex);
  };

  // Renderizza un singolo atleta nel bracket
  const renderPlayer = (playerId, isWinner) => {
    const athleteName = getAthleteName(playerId);
    const clubName = getAthleteClub(playerId);
    
    return (
      <Box
        sx={{
          height: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 1,
          borderBottom: '1px solid #ddd',
          bgcolor: playerId ? (isWinner ? '#e8f5e9' : 'white') : '#f5f5f5',
          '&:last-child': {
            borderBottom: 'none'
          }
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
            color: playerId ? 'text.primary' : 'text.disabled'
          }}
        >
          {athleteName || 'TBD'}
        </Typography>
        {clubName && (
          <Typography
            sx={{
              fontSize: '0.55rem',
              color: 'text.secondary',
              fontStyle: 'italic',
              lineHeight: 1.1,
              mt: 0.3
            }}
          >
            {clubName}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: '0.95rem', textAlign: 'center' }}>
        Tabellone Combattimenti
      </Typography>

      {/* Container del bracket orizzontale */}
      <Box sx={{ display: 'flex', gap: 2, minWidth: 'fit-content', justifyContent: 'center' }}>
        {rounds.map((round, roundIndex) => {
          const matchHeight = getMatchHeight(roundIndex);
          
          return (
            <Box key={roundIndex} sx={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
              {/* Etichetta del round */}
              <Typography
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  mb: 1,
                  bgcolor: 'grey.200',
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.400'
                }}
              >
                {getRoundLabel(roundIndex, rounds.length)}
              </Typography>

              {/* Matches del round */}
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-around' }}>
                {round.matches.map((match, matchIndex) => {
                  const player1Id = match.players[0];
                  const player2Id = match.players[1];
                  const winnerId = match.winner;

                  return (
                    <Box
                      key={match.id}
                      sx={{
                        height: `${matchHeight}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        mb: roundIndex === 0 ? 1 : 0
                      }}
                    >
                      {/* Box del match */}
                      <Box
                        sx={{
                          border: '2px solid',
                          borderColor: 'grey.800',
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: 'white',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: 1
                        }}
                      >
                        {/* Atleta 1 */}
                        {renderPlayer(player1Id, winnerId === player1Id)}
                        
                        {/* Atleta 2 */}
                        {renderPlayer(player2Id, winnerId === player2Id)}
                      </Box>

                      {/* Linea di connessione al round successivo */}
                      {roundIndex < rounds.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            right: -16,
                            top: '50%',
                            width: 16,
                            height: 2,
                            bgcolor: 'grey.600',
                            transform: 'translateY(-50%)'
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Legenda */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3, fontSize: '0.7rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#e8f5e9', border: '1px solid #ddd' }} />
          <Typography sx={{ fontSize: '0.65rem' }}>Vincitore</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#f5f5f5', border: '1px solid #ddd' }} />
          <Typography sx={{ fontSize: '0.65rem' }}>TBD</Typography>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Funzione helper per ottenere l'etichetta del round
 * @param {number} roundIndex - Indice del round (0-based)
 * @param {number} totalRounds - Numero totale di rounds
 * @returns {string}
 */
const getRoundLabel = (roundIndex, totalRounds) => {
  const roundsFromEnd = totalRounds - roundIndex - 1;
  
  if (roundsFromEnd === 0) return 'FINALE';
  if (roundsFromEnd === 1) return 'SEMIFINALI';
  if (roundsFromEnd === 2) return 'QUARTI DI FINALE';
  if (roundsFromEnd === 3) return 'OTTAVI DI FINALE';
  
  return `TURNO ${roundIndex + 1}`;
};

export default CategoryNotebookPrintBracketView;
