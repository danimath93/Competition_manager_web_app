// FightingDefinition.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';

/**
 * Componente per la definizione del tabellone dei combattimenti
 * Gestisce gli stati: IN_DEFINIZIONE e IN_ATTESA_DI_AVVIO
 */
const FightingDefinition = ({ 
  atleti, 
  tabellone,
  stato,
  onTabelloneChange,
  onConfirmDefinition
}) => {
  const [orderedFightingAthletes, setOrderedFightingAthletes] = useState([]);

  useEffect(() => {
    setOrderedFightingAthletes(atleti || []);
  }, [atleti]);

  // Genera tabellone da lista ordinata di atleti
  const generateTabelloneFromAtleti = (atletiList) => {
    const matchesRound0 = [];
    let idx = 0;
    
    while (idx < atletiList.length) {
      const p1 = atletiList[idx]?.id || null;
      const p2 = atletiList[idx + 1]?.id || null;
      matchesRound0.push({
        id: `r0m${matchesRound0.length}`,
        players: [p1, p2],
        scores: {},
        winner: null,
        from: []
      });
      idx += 2;
    }

    const rounds = [{ matches: matchesRound0 }];
    let prevMatches = matchesRound0;
    let roundIdx = 1;
    
    while (prevMatches.length > 1) {
      const curMatches = [];
      for (let i = 0; i < prevMatches.length; i += 2) {
        const left = prevMatches[i];
        const right = prevMatches[i + 1] || null;
        curMatches.push({
          id: `r${roundIdx}m${curMatches.length}`,
          players: [null, null],
          scores: {},
          winner: null,
          from: [left.id, right ? right.id : null]
        });
      }
      rounds.push({ matches: curMatches });
      prevMatches = curMatches;
      roundIdx += 1;
    }
    
    return { rounds };
  };

  const handleMoveFightingAthlete = (index, direction) => {
    const newList = [...orderedFightingAthletes];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setOrderedFightingAthletes(newList);
    
    // Rigenera automaticamente il tabellone
    const updatedBracket = generateTabelloneFromAtleti(newList);
    onTabelloneChange(updatedBracket);
  };

  const getRoundName = (roundIndex, totalRounds, matchesCount) => {
    if (roundIndex === totalRounds - 1) return "Finale";
    if (roundIndex === totalRounds - 2) return "Semifinale";
    if (matchesCount >= 8) return "Ottavi di finale";
    if (matchesCount < 8) return "Quarti di finale";
    return `Turno ${roundIndex + 1}`;
  };

  const getAthleteById = (id) => {
    return atleti.find(a => a.id === id) || null;
  };

  // Converte il tabellone interno nel formato richiesto da @g-loot/react-tournament-brackets
  const convertToLibraryFormat = (tabellone) => {
    if (!tabellone || !tabellone.rounds) return [];

    const matches = [];
    
    tabellone.rounds.forEach((round, roundIndex) => {
      round.matches.forEach((match) => {
        const player1 = getAthleteById(match.players[0]);
        const player2 = getAthleteById(match.players[1]);
        
        matches.push({
          id: match.id,
          name: `Match ${match.id}`,
          nextMatchId: roundIndex < tabellone.rounds.length - 1 
            ? tabellone.rounds[roundIndex + 1].matches.find(m => m.from?.includes(match.id))?.id 
            : null,
          tournamentRoundText: getRoundName(roundIndex, tabellone.rounds.length, round.matches.length),
          state: 'SCHEDULED',
          participants: [
            {
              id: match.players[0] || 'TBD-1',
              name: player1 ? `${player1.cognome} ${player1.nome}` : 'TBD',
              isWinner: false,
              status: null,
              resultText: null,
              picture: player1?.club?.denominazione || ''
            },
            {
              id: match.players[1] || 'TBD-2',
              name: player2 ? `${player2.cognome} ${player2.nome}` : 'TBD',
              isWinner: false,
              status: null,
              resultText: null,
              picture: player2?.club?.denominazione || ''
            }
          ]
        });
      });
    });

    return matches;
  };

  return (
    <Box>
      {stato === CategoryStates.IN_DEFINIZIONE && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Modifica l'ordine degli atleti per definire gli accoppiamenti. Il tabellone si aggiorna automaticamente.
        </Alert>
      )}

      {stato === CategoryStates.IN_ATTESA_DI_AVVIO && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Tabellone confermato. La categoria è pronta per essere avviata.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Lista ordinabile atleti */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ordine Accoppiamenti
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {stato === CategoryStates.IN_DEFINIZIONE && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Usa le frecce per riordinare gli atleti. Gli accoppiamenti sono definiti in ordine sequenziale.
              </Typography>
            )}

            <List dense>
              {orderedFightingAthletes.map((atleta, idx) => (
                <ListItem 
                  key={atleta.id}
                  sx={{ 
                    bgcolor: idx % 2 === 0 ? 'action.hover' : 'background.paper',
                    borderRadius: 1,
                    mb: 0.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  secondaryAction={
                    stato === CategoryStates.IN_DEFINIZIONE && (
                      <Box>
                        <IconButton 
                          size="small"
                          onClick={() => handleMoveFightingAthlete(idx, 'up')}
                          disabled={idx === 0}
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleMoveFightingAthlete(idx, 'down')}
                          disabled={idx === orderedFightingAthletes.length - 1}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="bold">
                        {idx + 1}. {atleta.cognome} {atleta.nome}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {atleta.club?.denominazione || '-'}
                        {atleta.peso && ` • ${atleta.peso} kg`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {stato === CategoryStates.IN_DEFINIZIONE && (
              <Button 
                variant="contained"
                color="success"
                onClick={onConfirmDefinition}
                fullWidth
                sx={{ mt: 2 }}
                disabled={!tabellone || !tabellone.rounds || tabellone.rounds.length === 0}
              >
                Conferma Tabellone
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Anteprima Tabellone */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Anteprima Tabellone
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {tabellone && tabellone.rounds && tabellone.rounds.length > 0 ? (
              <Box sx={{ 
                height: 600, 
                width: '100%',
                '& .bracket': {
                  fontSize: '12px'
                }
              }}>
                <SingleEliminationBracket
                  matches={convertToLibraryFormat(tabellone)}
                  matchComponent={Match}
                  svgWrapper={({ children, ...props }) => (
                    <SVGViewer 
                      width={800} 
                      height={600}
                      background="#FAFAFA"
                      SVGBackground="#FAFAFA"
                      {...props}
                    >
                      {children}
                    </SVGViewer>
                  )}
                />
              </Box>
            ) : (
              <Alert severity="warning">
                Nessun tabellone disponibile. Il tabellone verrà generato automaticamente dall'ordine degli atleti.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FightingDefinition;
