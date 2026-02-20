import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

/**
 * Componente per visualizzare il tabellone di un torneo di combattimento per la stampa
 * Replica la struttura verticale di FightingExecution ma ottimizzata per stampa B/N
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

  const rounds = tabellone.rounds;

  // Funzione helper per ottenere l'atleta dall'ID
  const getAthleteById = (playerId) => {
    if (!playerId) return null;
    return athletes.find(a => a.id === playerId) || null;
  };

  // Determina il nome del round (come in FightingExecution)
  const getRoundName = (roundIndex, numMatches) => {
    if (numMatches === 1) return "Finale";
    if (numMatches === 2) return "Semifinale";
    if (numMatches === 3 || numMatches === 4) return "Quarti di finale";
    if (numMatches > 4 && numMatches <= 8) return "Ottavi di finale";
    return `Turno ${roundIndex + 1}`;
  };

  // Configurazione layout verticale - dimensioni ridotte per stampa
  const MATCH_HEIGHT = 120;
  const MATCH_SPACING = 30;

  /**
   * Componente per renderizzare un singolo match per la stampa
   * Layout semplificato con solo R e B separati da | dalle info atleta
   */
  const PrintMatchComponent = ({ match, atleta1, atleta2, roundIndex = 0 }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          bgcolor: 'white',
          border: '1px solid black',
          overflow: 'hidden',
          height: MATCH_HEIGHT,
        }}
      >
        {/* Atleta 1 (Rosso) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            height: MATCH_HEIGHT / 2,
            borderBottom: '1px solid black',
          }}
        >
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', mr: 0.5 }}>
            R
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', mr: 0.5 }}>|</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 'normal',
                color: 'black',
                lineHeight: 1.1
              }}
            >
              {atleta1 ? `${atleta1.cognome} ${atleta1.nome}` : (atleta2 && roundIndex === 0 ? 'BYE' : '')}
            </Typography>
            {atleta1 && (
              <Typography sx={{ fontSize: '0.45rem', color: 'text.secondary', lineHeight: 1 }}>
                {atleta1.club?.abbreviazione || atleta1.club?.denominazione || '-'} • {atleta1.peso || '-'} kg
              </Typography>
            )}
          </Box>
        </Box>

        {/* Atleta 2 (Blu) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            height: MATCH_HEIGHT / 2,
          }}
        >
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', mr: 0.5 }}>
            B
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', mr: 0.5 }}>|</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 'normal',
                color: 'black',
                lineHeight: 1.1
              }}
            >
              {atleta2 ? `${atleta2.cognome} ${atleta2.nome}` : (atleta1 && roundIndex === 0 ? 'BYE' : '')}
            </Typography>
            {atleta2 && (
              <Typography sx={{ fontSize: '0.45rem', color: 'text.secondary', lineHeight: 1 }}>
                {atleta2.club?.abbreviazione || atleta2.club?.denominazione || '-'} • {atleta2.peso || '-'} kg
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // Calcola margine per centrare rispetto al turno precedente
  const calculateMargin = (roundIndex) => {
    if (roundIndex === 0) return MATCH_SPACING / 2;
    return (Math.pow(2, roundIndex-1) * 2 * (MATCH_SPACING + MATCH_HEIGHT) - MATCH_HEIGHT) / 2;
  };

  // Calcola gap tra i round in base al numero di round totali
  const getRoundGapByRounds = (numRounds) => {
    if (numRounds <= 3) return 10;
    if (numRounds > 3 && numRounds <= 4) return 8;
    if (numRounds > 4 && numRounds <= 8) return 6;
    return 4;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <style>
        {`
          @media print {
            .bracket-container {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .bracket-round {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        `}
      </style>

      {/* Container del bracket verticale */}
      <Box 
        className="bracket-container"
        sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: getRoundGapByRounds(rounds.length),
          alignItems: 'flex-start',
          overflowX: 'visible'
        }}
      >
        {rounds.map((round, roundIndex) => {
          return (
            <Box 
              key={roundIndex} 
              className="bracket-round"
              sx={{ width: 250 }}
            >
              {/* Titolo del round */}
              <Typography 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  mb: 1.2,
                  pb: 0.25,
                  borderBottom: '2px solid black'
                }}
              >
                {getRoundName(roundIndex, round.matches.length)}
              </Typography>
              
              {/* Matches del round disposti verticalmente */}
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {round.matches.map((match, matchIndex) => {
                  const atleta1 = getAthleteById(match.players[0]);
                  const atleta2 = getAthleteById(match.players[1]);
                  const boxSize = calculateMargin(roundIndex);
                  
                  return (
                    <>
                      <Box 
                        key={`empty-top-box-match-${match.id}`}
                        sx={{
                          height: boxSize,
                        }}
                      />
                      <PrintMatchComponent
                        match={match}
                        atleta1={atleta1}
                        atleta2={atleta2}
                        roundIndex={roundIndex}
                      />
                      <Box 
                        key={`empty-bottom-box-match-${match.id}`}
                        sx={{
                          height: boxSize ,
                        }}
                      />
                    </>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CategoryNotebookPrintBracketView;
