// FightingExecution.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Alert,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';
import MatchComponent from './MatchComponent';
import ConfirmActionModal from '../../../../components/common/ConfirmActionModal';
import AuthComponent from '../../../../components/AuthComponent';

const COMMISSIONE_LABELS = [
  'Capo Commissione',
  'Giudice 1',
  'Giudice 2',
  'Giudice 3',
  'Giudice 4',
  'Giudice 5',
  'Giudice di Riserva',
  '1° Addetto al Tavolo',
  '2° Addetto al Tavolo',
  '3° Addetto al Tavolo'
];

/**
 * Componente per l'esecuzione dei combattimenti e visualizzazione risultati
 * Gestisce gli stati: IN_CORSO e CONCLUSA
 */
const FightingExecution = ({ 
  atleti, 
  tabellone,
  classifica,
  commissione,
  stato,
  onTabelloneChange,
  onUpdateSvolgimento,
  onCommissioneChange,
  onStartCategory,
  onConcludeCategory
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmingConcludeDialogOpen, setIsConfirmingConcludeDialogOpen] = useState(false);
  const [localClassifica, setLocalClassifica] = useState([]);

  const canEdit = stato === CategoryStates.IN_CORSO || isEditMode;

  useEffect(() => {
    // Calcola classifica automaticamente quando cambia il tabellone
    if (tabellone) {
      const newClassifica = calculateClassifica();
      setLocalClassifica(newClassifica);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabellone]);

  const calculateClassifica = () => {
    if (!tabellone || !tabellone.rounds || tabellone.rounds.length === 0) return [];

    const finalRound = tabellone.rounds[tabellone.rounds.length - 1];
    const finalMatch = finalRound.matches[0];

    if (!finalMatch || !finalMatch.winner) return [];

    // Primo posto: vincitore finale
    const winner = finalMatch.winner;
    // Secondo posto: perdente finale
    const finalLoser = finalMatch.players.find(p => p && p !== winner);

    // Terzi posti: perdenti semifinali
    const semiRound = tabellone.rounds.length > 1 ? tabellone.rounds[tabellone.rounds.length - 2] : null;
    const semiLosers = [];
    
    if (semiRound) {
      semiRound.matches.forEach(match => {
        if (match.winner) {
          const loser = match.players.find(p => p && p !== match.winner);
          if (loser && loser !== winner && loser !== finalLoser) {
            semiLosers.push(loser);
          }
        }
      });
    }

    const result = [
      { pos: 1, atletaId: winner },
      finalLoser ? { pos: 2, atletaId: finalLoser } : null,
      ...semiLosers.slice(0, 2).map(id => ({ pos: 3, atletaId: id }))
    ].filter(Boolean);

    return result;
  };

  const getAthleteById = (id) => {
    return atleti?.find(a => a.id === id) || null;
  };

  const handleRoundClick = (matchId, roundIndex) => {
    if (!canEdit) return;

    const copy = JSON.parse(JSON.stringify(tabellone));
    
    // Trova il match
    let targetMatch = null;
    let roundIdx = -1;
    
    for (let rIdx = 0; rIdx < copy.rounds.length; rIdx++) {
      const match = copy.rounds[rIdx].matches.find(m => m.id === matchId);
      if (match) {
        targetMatch = match;
        roundIdx = rIdx;
        break;
      }
    }

    if (!targetMatch || !targetMatch.roundResults) return;

    // Cicla tra: null -> red -> blue -> yellow -> null
    const current = targetMatch.roundResults[roundIndex];
    let next = null;
    if (current === null) next = 'red';
    else if (current === 'red') next = 'blue';
    else if (current === 'blue') next = 'yellow';
    else if (current === 'yellow') next = null;

    targetMatch.roundResults[roundIndex] = next;

    // Calcola vincitore automaticamente
    const redWins = targetMatch.roundResults.filter(r => r === 'red').length;
    const blueWins = targetMatch.roundResults.filter(r => r === 'blue').length;

    if (redWins > 1) {
      targetMatch.winner = targetMatch.players[0];
    } else if (blueWins > 1) {
      targetMatch.winner = targetMatch.players[1];
    } else {
      targetMatch.winner = null;
    }

    // Propaga vincitore al turno successivo
    if (targetMatch.winner && roundIdx < copy.rounds.length - 1) {
      const nextRound = copy.rounds[roundIdx + 1];
      nextRound.matches.forEach(nm => {
        const pos = nm.from?.indexOf(targetMatch.id);
        if (pos !== -1 && pos !== undefined) {
          nm.players[pos] = targetMatch.winner;
        }
      });
    }

    onTabelloneChange(copy);
  };

  const handleWinnerClick = (matchId) => {
    if (!canEdit) return;
    // Implementazione futura per gestione parità
    alert('Funzionalità di gestione parità in sviluppo');
  };

  const getRoundName = (roundIndex, numMatches) => {
    if (numMatches === 1) return "Finale";
    if (numMatches === 2) return "Semifinale";
    if (numMatches === 4) return "Quarti di finale";
    if (numMatches === 8) return "Ottavi di finale";
    return `Turno ${roundIndex + 1}`;
  };

  const getClassifiedAthlete = (position) => {
    const entries = localClassifica.filter(c => c.pos === position);
    if (entries.length === 0) return null;
    
    if (entries.length === 1) {
      const atleta = getAthleteById(entries[0].atletaId);
      return atleta ? `${atleta.cognome} ${atleta.nome}` : '-';
    }
    
    // Più atleti nella stessa posizione
    return entries.map(e => {
      const atleta = getAthleteById(e.atletaId);
      return atleta ? `${atleta.cognome} ${atleta.nome}` : '-';
    }).join('\n');
  };

  const handleStartCategory = async () => {
    if (onStartCategory) {
      await onStartCategory();
    }
  };

  const handleConcludeCategory = async () => {
    if (onConcludeCategory) {
      // Salva la classifica calcolata
      await onConcludeCategory(localClassifica);
      setIsConfirmingConcludeDialogOpen(false);
      setIsEditMode(false);
    }
  };

  const handleConfirmConclude = () => {
    setIsConfirmingConcludeDialogOpen(true);
  };

  return (
    <div className="page-grid-75-25">
      {/* Tabellone - Sinistra */}
      <div className="page-card-with-external-title page-card-expanded">
        <div className="page-card-scrollable">
          <div className="page-card-scrollable-body" style={{ padding: '1rem' }}>

            <Typography variant="h6" gutterBottom>
              Tabellone Incontri
            </Typography>

            {stato === CategoryStates.CONCLUSA && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Categoria conclusa. Il podio è stato determinato automaticamente.
              </Alert>
            )}

            {isEditMode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Attenzione, è necessario concludere la categoria per salvare le modifiche alla classifica.
              </Alert>
            )}

            <Divider sx={{ mb: 3 }} />

            {tabellone && tabellone.rounds && tabellone.rounds.length > 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 8,
                alignItems: 'flex-start',
                overflowX: 'auto',
                pb: 1
              }}>
                {tabellone.rounds.map((round, roundIndex) => {
                  const MATCH_HEIGHT = 200;
                  const MATCH_SPACING = 50;
                  
                  // Calcola margine per centrare rispetto al turno precedente
                  const calculateMargin = (matchIndex) => {
                    if (roundIndex === 0) return MATCH_SPACING / 2; // Primo round, margine standard
                    // Ogni match del turno corrente deve essere centrato tra due match del turno precedente
                    return (Math.pow(2, roundIndex-1) * 2 * (MATCH_SPACING + MATCH_HEIGHT) - MATCH_HEIGHT) / 2;
                  };
                  
                  return (
                    <Box key={roundIndex} sx={{ minWidth: 350 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        sx={{ mb: 3, color: 'primary.main', textAlign: 'center' }}
                      >
                        {getRoundName(roundIndex, round.matches.length)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        {round.matches.map((match, matchIndex) => {
                          const atleta1 = getAthleteById(match.players[0]);
                          const atleta2 = getAthleteById(match.players[1]);
                          const emptyBoxSize = calculateMargin(matchIndex);
                          
                          return (
                            <>
                              <Box 
                                key={`empty-top-box-match-${match.id}`}
                                sx={{
                                  height: emptyBoxSize,
                                }}
                              />
                              <Box 
                                key={match.id}
                                sx={{
                                  height: MATCH_HEIGHT,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <MatchComponent
                                  match={match}
                                  atleta1={atleta1}
                                  atleta2={atleta2}
                                  isEditable={canEdit}
                                  onRoundClick={handleRoundClick}
                                  onWinnerClick={handleWinnerClick}
                                />
                              </Box>
                              <Box 
                                key={`empty-bottom-box-match-${match.id}`}
                                sx={{
                                  height: emptyBoxSize,
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
            ) : (
              <Alert severity="warning">
                Nessun tabellone disponibile.
              </Alert>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
              <AuthComponent requiredRoles={['admin', 'superAdmin']}>
                {stato !== CategoryStates.IN_CORSO && !isEditMode && (
                  <Button variant="warning" onClick={() => setIsEditMode(true)}>
                    Modifica
                  </Button>
                )}
                
                {stato !== CategoryStates.IN_CORSO && isEditMode && (
                  <Button variant="info" onClick={() => setIsEditMode(false)}>
                    Annulla Modifica
                  </Button>
                )}
              </AuthComponent>
              
              {stato === CategoryStates.IN_ATTESA_DI_AVVIO && (
                <Button variant="success" onClick={handleStartCategory}>
                  Avvia categoria
                </Button>
              )}

              {(stato === CategoryStates.IN_CORSO || isEditMode) && canEdit && (
                <Button onClick={handleConfirmConclude}>
                  Concludi Categoria
                </Button>
              )}
            </Box>
          </div>
        </div>
      </div>

      {/* Colonna Destra: Classifica e Commissione */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Classifica */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🏆 Classifica
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell><b>Atleta</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4].map((pos) => {
                  const athlete = getClassifiedAthlete(pos);
                  
                  return (
                    <TableRow key={pos}>
                      <TableCell>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: pos === 1 ? 'warning.main' : pos === 2 ? 'grey.400' : pos === 3 ? 'warning.dark' : 'grey.300',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        >
                          {pos}°
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            fontWeight: pos <= 3 ? 'bold' : 'normal'
                          }}
                        >
                          {athlete || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {localClassifica.filter(c => c.pos === 3).length === 2 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Doppio terzo posto
            </Alert>
          )}
        </Paper>

        {/* Commissione */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Commissione
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {COMMISSIONE_LABELS.map((label, idx) => (
              <Box key={label}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  {label}
                </Typography>
                <TextField
                  value={commissione?.[idx] || ''}
                  onChange={(e) => onCommissioneChange(idx, e.target.value)}
                  size="small"
                  fullWidth
                  disabled={!canEdit}
                  placeholder="Nome e Cognome"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </div>

      <ConfirmActionModal 
        open={isConfirmingConcludeDialogOpen}
        onClose={() => setIsConfirmingConcludeDialogOpen(false)}
        title="Conferma conclusione categoria"
        message="Sei sicuro di voler concludere la categoria? Questa azione è irreversibile e salverà la classifica finale."
        primaryButton={{
          text: 'Concludi',
          onClick: handleConcludeCategory,
        }}
        secondaryButton={{
          text: 'Annulla',
          onClick: () => setIsConfirmingConcludeDialogOpen(false),
        }}
      />
    </div>
  );
};

export default FightingExecution;
