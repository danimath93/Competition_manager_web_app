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
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';
import MatchComponent from './MatchComponent';

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
  const [availableAthletes, setAvailableAthletes] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Inizializza tabellone vuoto se non esiste
    if (!tabellone || !tabellone.rounds) {
      initializeEmptyBracket();
    } else {
      updateAvailableAthletes();
    }
  }, [atleti, tabellone]);

  const initializeEmptyBracket = () => {
    const numAtleti = atleti?.length || 0;
    if (numAtleti < 2) return;

    // Determina quanti round visualizzare (primi 2 round max)
    const numMatchesFirstRound = Math.pow(2, Math.ceil(Math.log2(numAtleti)) - 1);
    
    // Crea primo round con match vuoti
    const firstRoundMatches = [];
    for (let i = 0; i < numMatchesFirstRound; i++) {
      firstRoundMatches.push({
        id: `r0m${i}`,
        players: [null, null],
        roundResults: [null, null, null],
        winner: null,
        from: []
      });
    }

    // Crea secondo round
    const secondRoundMatches = [];
    for (let i = 0; i < numMatchesFirstRound / 2; i++) {
      secondRoundMatches.push({
        id: `r1m${i}`,
        players: [null, null],
        roundResults: [null, null, null],
        winner: null,
        from: [`r0m${i * 2}`, `r0m${i * 2 + 1}`]
      });
    }

    const newTabellone = {
      rounds: [
        { matches: firstRoundMatches },
        { matches: secondRoundMatches }
      ]
    };

    onTabelloneChange(newTabellone);
  };

  const updateAvailableAthletes = () => {
    if (!tabellone || !atleti) return;
    
    // Trova tutti gli atleti già assegnati
    const assignedIds = new Set();
    tabellone.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.players[0]) assignedIds.add(match.players[0]);
        if (match.players[1]) assignedIds.add(match.players[1]);
      });
    });

    // Filtra atleti disponibili
    const available = atleti.filter(a => !assignedIds.has(a.id));
    setAvailableAthletes(available);
  };

  const handleAtletaClick = (matchId, position) => {
    if (stato !== CategoryStates.IN_DEFINIZIONE) return;
    
    setSelectedMatch(matchId);
    setSelectedPosition(position === 'red' ? 0 : 1);
    setDialogOpen(true);
  };

  const handleAtletaSelection = (atletaId) => {
    const copy = JSON.parse(JSON.stringify(tabellone));
    
    // Trova il match
    let targetMatch = null;
    for (const round of copy.rounds) {
      const match = round.matches.find(m => m.id === selectedMatch);
      if (match) {
        targetMatch = match;
        break;
      }
    }

    if (targetMatch) {
      targetMatch.players[selectedPosition] = atletaId;
      onTabelloneChange(copy);
    }

    setDialogOpen(false);
    setSelectedMatch(null);
    setSelectedPosition(null);
  };

  const getRoundName = (roundIndex, numMatches) => {
    if (numMatches === 1) return "Finale";
    if (numMatches === 2) return "Semifinale";
    if (numMatches === 4) return "Quarti di finale";
    if (numMatches === 8) return "Ottavi di finale";
    return `Turno ${roundIndex + 1}`;
  };

  const getAthleteById = (id) => {
    return atleti?.find(a => a.id === id) || null;
  };

  const isTabelloneComplete = () => {
    if (!tabellone || !tabellone.rounds) return false;
    
    // Verifica che il primo round sia completo
    const firstRound = tabellone.rounds[0];
    for (const match of firstRound.matches) {
      if (!match.players[0] || !match.players[1]) {
        return false;
      }
    }
    return true;
  };

  return (
    <Box>
      {stato === CategoryStates.IN_DEFINIZIONE && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Clicca sulle caselle del tabellone per assegnare gli atleti agli incontri.
          Solo i primi due turni sono visualizzati per la definizione.
        </Alert>
      )}

      {stato === CategoryStates.IN_ATTESA_DI_AVVIO && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Tabellone confermato. La categoria è pronta per essere avviata.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Lista atleti disponibili - Sinistra */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Atleti Disponibili
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Totale atleti: {atleti?.length || 0} | Assegnati: {(atleti?.length || 0) - availableAthletes.length}
            </Typography>

            <List dense>
              {atleti?.map((atleta) => {
                const isAssigned = !availableAthletes.some(a => a.id === atleta.id);
                return (
                  <ListItem 
                    key={atleta.id}
                    sx={{ 
                      bgcolor: isAssigned ? 'action.disabledBackground' : 'background.paper',
                      borderRadius: 1,
                      mb: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: isAssigned ? 0.5 : 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={isAssigned ? 'normal' : 'bold'}>
                          {atleta.cognome} {atleta.nome}
                          {isAssigned && ' ✓'}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {atleta.club?.denominazione || '-'} • {atleta.peso || '-'} kg
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            {stato === CategoryStates.IN_DEFINIZIONE && (
              <Button 
                variant="contained"
                color="success"
                onClick={onConfirmDefinition}
                fullWidth
                sx={{ mt: 2 }}
                disabled={!isTabelloneComplete()}
              >
                Conferma Tabellone
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Tabellone - Destra */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tabellone Incontri
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {tabellone && tabellone.rounds && tabellone.rounds.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tabellone.rounds.slice(0, 2).map((round, roundIndex) => (
                  <Box key={roundIndex}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      {getRoundName(roundIndex, round.matches.length)}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {round.matches.map((match) => {
                        const atleta1 = getAthleteById(match.players[0]);
                        const atleta2 = getAthleteById(match.players[1]);
                        
                        return (
                          <Grid item xs={12} sm={6} md={round.matches.length > 2 ? 6 : 12} key={match.id}>
                            <MatchComponent
                              match={match}
                              atleta1={atleta1}
                              atleta2={atleta2}
                              isEditable={stato === CategoryStates.IN_DEFINIZIONE}
                              onAtletaClick={handleAtletaClick}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="warning">
                Inizializzazione tabellone in corso...
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog per selezione atleta */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seleziona Atleta</DialogTitle>
        <DialogContent>
          <List>
            {availableAthletes.map((atleta) => (
              <ListItem
                key={atleta.id}
                button
                onClick={() => handleAtletaSelection(atleta.id)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemText
                  primary={`${atleta.cognome} ${atleta.nome}`}
                  secondary={`${atleta.club?.denominazione || '-'} • ${atleta.peso || '-'} kg`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annulla</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FightingDefinition;
