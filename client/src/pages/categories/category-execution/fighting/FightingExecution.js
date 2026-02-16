// FightingExecution.js
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { SingleEliminationBracket, SVGViewer, createTheme } from '@g-loot/react-tournament-brackets';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';
import CustomMatchComponent from './CustomMatchComponent';

// Tema personalizzato per il bracket
const BracketTheme = createTheme({
  textColor: { main: '#000000', highlighted: '#07090D', dark: '#3E414D' },
  matchBackground: { wonColor: '#e3f2fd', lostColor: '#ffffff' },
  score: {
    background: { wonColor: '#2196f3', lostColor: '#bdbdbd' },
    text: { highlightedWonColor: '#ffffff', highlightedLostColor: '#ffffff' },
  },
  border: {
    color: '#CED1F2',
    highlightedColor: '#2196f3',
  },
  roundHeader: { backgroundColor: '#2196f3', fontColor: '#fff' },
  connectorColor: '#CED1F2',
  connectorColorHighlight: '#2196f3',
  svgBackground: '#FAFAFA',
});

/**
 * Componente per l'esecuzione dei combattimenti e visualizzazione risultati
 * Gestisce gli stati: IN_CORSO e CONCLUSA
 */
const FightingExecution = ({ 
  atleti, 
  tabellone,
  classifica,
  stato,
  onTabelloneChange,
  onUpdateSvolgimento
}) => {

  const getAthleteById = (id) => {
    return atleti.find(a => a.id === id) || null;
  };

  const renderAthleteData = (id, field) => {
    const atleta = getAthleteById(id);
    if (!atleta) return '-';
    if (field && atleta[field]) {
      if (field === 'club' && atleta[field]?.denominazione) {
        return atleta[field].denominazione;
      }
      return atleta[field];
    }
    return `${atleta.nome} ${atleta.cognome}`;
  };

  const getRoundName = (roundIndex, totalRounds, matchesCount) => {
    if (roundIndex === totalRounds - 1) return "Finale";
    if (roundIndex === totalRounds - 2) return "Semifinale";
    if (matchesCount >= 8) return "Ottavi di finale";
    if (matchesCount < 8) return "Quarti di finale";
    return `Turno ${roundIndex + 1}`;
  };

  // Converte il tabellone interno nel formato richiesto da @g-loot/react-tournament-brackets
  const convertToLibraryFormat = (tabellone) => {
    if (!tabellone || !tabellone.rounds) return [];

    const matches = [];
    
    tabellone.rounds.forEach((round, roundIndex) => {
      round.matches.forEach((match) => {
        const player1 = getAthleteById(match.players[0]);
        const player2 = getAthleteById(match.players[1]);
        
        const p1Score = match.scores?.[match.players[0]];
        const p2Score = match.scores?.[match.players[1]];
        
        matches.push({
          id: match.id,
          name: `Match ${match.id}`,
          nextMatchId: roundIndex < tabellone.rounds.length - 1 
            ? tabellone.rounds[roundIndex + 1].matches.find(m => m.from?.includes(match.id))?.id 
            : null,
          tournamentRoundText: getRoundName(roundIndex, tabellone.rounds.length, round.matches.length),
          state: match.winner ? 'DONE' : 'SCHEDULED',
          participants: [
            {
              id: match.players[0] || 'TBD-1',
              name: player1 ? `${player1.cognome} ${player1.nome}` : 'TBD',
              isWinner: match.winner === match.players[0],
              status: match.winner ? 'PLAYED' : null,
              resultText: p1Score != null ? String(p1Score) : '',
              picture: player1?.club?.denominazione || ''
            },
            {
              id: match.players[1] || 'TBD-2',
              name: player2 ? `${player2.cognome} ${player2.nome}` : 'TBD',
              isWinner: match.winner === match.players[1],
              status: match.winner ? 'PLAYED' : null,
              resultText: p2Score != null ? String(p2Score) : '',
              picture: player2?.club?.denominazione || ''
            }
          ]
        });
      });
    });

    return matches;
  };

  const handleScoreChange = (matchId, atletaId, val) => {
    const score = parseInt(val);

    const copy = JSON.parse(JSON.stringify(tabellone));
    
    // Trova il match nel tabellone
    let targetMatch = null;
    let roundIndex = -1;
    
    for (let rIdx = 0; rIdx < copy.rounds.length; rIdx++) {
      const match = copy.rounds[rIdx].matches.find(m => m.id === matchId);
      if (match) {
        targetMatch = match;
        roundIndex = rIdx;
        break;
      }
    }

    if (!targetMatch) return;

    targetMatch.scores = targetMatch.scores || {};
    targetMatch.scores[atletaId] = isNaN(score) ? null : score;

    const p1 = targetMatch?.players[0];
    const p2 = targetMatch?.players[1];

    if (p1 && p2) {
      const s1 = targetMatch.scores[p1];
      const s2 = targetMatch.scores[p2];

      if (s1 != null && s2 != null) {
        if (s1 > s2) {
          targetMatch.winner = targetMatch.players[0];
        } else if (s2 > s1) {
          targetMatch.winner = targetMatch.players[1];
        } else {
          targetMatch.winner = null;
        }
      }
    }

    // Propaga il vincitore al turno successivo
    if (targetMatch.winner) {
      const nextRound = copy.rounds[roundIndex + 1];
      if (nextRound) {
        nextRound.matches.forEach(nm => {
          const pos = nm.from.indexOf(targetMatch.id);
          if (pos !== -1) {
            nm.players[pos] = targetMatch.winner;
          }
        });
      }
    }

    // Calcolo podio automatico se è la finale
    const finalRound = copy.rounds[copy.rounds.length - 1];
    const finalMatch = finalRound.matches[0];

    if (finalMatch && finalMatch.winner) {
      const finalWinnerReal = finalMatch.winner;
      const finalLoserPlayer = finalMatch.players.find(p => p && p !== finalMatch.winner);
      const finalLoserReal = finalLoserPlayer || null;

      // Semiclassificati: losers delle semifinali
      const semiRound = copy.rounds.length > 1 ? copy.rounds[copy.rounds.length - 2] : null;
      let semisReal = [];
      if (semiRound) {
        for (const sm of semiRound.matches) {
          if (sm.winner) {
            const loserSnapshot = sm.players.find(p => p && p !== sm.winner);
            if (loserSnapshot) {
              const rid = loserSnapshot;
              if (rid) semisReal.push(rid);
            }
          }
        }
      }

      const used = new Set([finalWinnerReal, finalLoserReal].filter(Boolean));
      semisReal = semisReal.filter(rid => rid && !used.has(rid));
      if (semisReal.length < 2) {
        const allReal = atleti.map(a => a.id).filter(Boolean);
        for (const rid of allReal) {
          if (semisReal.length >= 2) break;
          if (!used.has(rid) && !semisReal.includes(rid)) semisReal.push(rid);
        }
      }

      const uniqueSemis = [];
      for (const rid of semisReal) {
        if (!uniqueSemis.includes(rid)) uniqueSemis.push(rid);
        if (uniqueSemis.length >= 2) break;
      }

      const classificaToSave = [
        finalWinnerReal ? { pos: 1, atletaId: finalWinnerReal } : null,
        finalLoserReal ? { pos: 2, atletaId: finalLoserReal } : null,
        uniqueSemis[0] ? { pos: 3, atletaId: uniqueSemis[0] } : null,
        uniqueSemis[1] ? { pos: 3, atletaId: uniqueSemis[1] } : null,
      ].filter(Boolean);

      onUpdateSvolgimento({
        tabellone: copy,
        classifica: classificaToSave,
        stato: CategoryStates.CONCLUSA
      });
    } else {
      onUpdateSvolgimento({
        tabellone: copy,
        stato: CategoryStates.IN_CORSO
      });
    }

    // Caso BYE: un solo giocatore -> auto-winner e propagate
    if (targetMatch.players[0] && !targetMatch.players[1]) {
      targetMatch.winner = targetMatch.players[0];

      const nextRound = copy.rounds[roundIndex + 1];
      if (nextRound) {
        nextRound.matches.forEach(nm => {
          const pos = nm.from.indexOf(targetMatch.id);
          if (pos !== -1) {
            nm.players[pos] = targetMatch.winner;
          }
        });
      }

      onUpdateSvolgimento({
        tabellone: copy,
        stato: CategoryStates.IN_CORSO
      });
    }
  };

  const getClassifiedAthlete = (position) => {
    const entry = classifica.find(c => c.pos === position);
    if (!entry) return null;
    return renderAthleteData(entry.atletaId);
  };

  const libraryMatches = convertToLibraryFormat(tabellone);

  return (
    <Box>
      {stato === CategoryStates.CONCLUSA && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Categoria conclusa. Il podio è stato determinato automaticamente.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tabellone */}
        <Grid item xs={12} lg={9}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Tabellone Incontri
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ height: 700, width: '100%' }}>
              <SingleEliminationBracket
                matches={libraryMatches}
                theme={BracketTheme}
                options={{
                  style: {
                    roundHeader: {
                      backgroundColor: BracketTheme.roundHeader.backgroundColor,
                      fontColor: BracketTheme.roundHeader.fontColor,
                    },
                    connectorColor: BracketTheme.connectorColor,
                    connectorColorHighlight: BracketTheme.connectorColorHighlight,
                  },
                }}
                matchComponent={(props) => (
                  <CustomMatchComponent
                    {...props}
                    onScoreChange={handleScoreChange}
                    stato={stato}
                    isEditable={stato === CategoryStates.IN_CORSO}
                  />
                )}
                svgWrapper={({ children, ...props }) => (
                  <SVGViewer
                    background={BracketTheme.svgBackground}
                    SVGBackground={BracketTheme.svgBackground}
                    width={900}
                    height={700}
                    {...props}
                  >
                    {children}
                  </SVGViewer>
                )}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Podio */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              🏆 Podio
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((pos) => {
                const athlete = getClassifiedAthlete(pos);
                return (
                  <Box
                    key={pos}
                    sx={{
                      p: 2,
                      border: '2px solid',
                      borderColor: pos === 1 ? 'warning.main' : pos === 2 ? 'grey.400' : 'warning.dark',
                      borderRadius: 2,
                      bgcolor: pos === 1 ? 'warning.light' : pos === 2 ? 'grey.100' : 'warning.lighter',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {pos}°
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {athlete || '-'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {classifica.filter(c => c.pos === 3).length === 2 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Doppio terzo posto
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FightingExecution;
