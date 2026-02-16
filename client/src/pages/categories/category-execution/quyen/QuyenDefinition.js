// QuyenDefinition.js
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert
} from '@mui/material';
import { Shuffle } from '@mui/icons-material';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';

/**
 * Componente per la definizione dell'ordine di esecuzione delle forme (Quyen/Armi)
 * Gestisce gli stati: IN_DEFINIZIONE e IN_ATTESA_DI_AVVIO
 */
const QuyenDefinition = ({ 
  atleti, 
  letter, 
  stato,
  onLetterChange, 
  onConfirmDefinition,
  onUpdateSvolgimento
}) => {
  const [manualLetter, setManualLetter] = useState('');

  // Ordina gli atleti in base alla lettera estratta
  const orderAthletesByKeyLetter = (atletiList, keyLetter) => {
    if (!keyLetter) return atletiList;

    const orderedAthletes = [...(atletiList || [])].sort((a, b) => {
      const nameA = (a.cognome || '').toUpperCase();
      const nameB = (b.cognome || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });

    let orderIdx = orderedAthletes.findIndex(a => 
      (a.cognome || '').toUpperCase().startsWith(keyLetter.toUpperCase())
    );
    
    if (orderIdx !== -1) {
      return [
        ...orderedAthletes.slice(orderIdx),
        ...orderedAthletes.slice(0, orderIdx)
      ];
    } else {
      orderIdx = orderedAthletes.findIndex(a => 
        (a.cognome || '').toUpperCase() > keyLetter.toUpperCase()
      );
      return orderIdx !== -1
        ? [...orderedAthletes.slice(orderIdx), ...orderedAthletes.slice(0, orderIdx)]
        : orderedAthletes;
    }
  };

  const handleGenerateRandomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    onLetterChange(randomLetter);
  };

  const handleSetManualLetter = () => {
    if (!manualLetter || manualLetter.length !== 1) {
      alert('Inserisci una lettera valida');
      return;
    }
    const upperLetter = manualLetter.toUpperCase();
    onLetterChange(upperLetter);
    setManualLetter('');
  };

  const orderedAthletes = orderAthletesByKeyLetter(atleti, letter);

  return (
    <Box>
      {/* Sezione estrazione lettera */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Definizione Ordine di Esecuzione
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {stato === CategoryStates.IN_DEFINIZIONE && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography variant="body1">
                <b>Lettera estratta:</b> {letter || 'Non ancora estratta'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<Shuffle />}
                onClick={handleGenerateRandomLetter}
              >
                Estrai Lettera Casuale
              </Button>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Lettera Manuale"
                  value={manualLetter}
                  onChange={(e) => setManualLetter(e.target.value.toUpperCase())}
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ maxLength: 1 }}
                />
                <Button 
                  variant="outlined"
                  onClick={handleSetManualLetter}
                >
                  Imposta
                </Button>
              </Box>
            </Box>

            {letter && (
              <Button 
                variant="contained" 
                color="success"
                onClick={onConfirmDefinition}
                sx={{ mb: 2 }}
              >
                Conferma Definizione
              </Button>
            )}
          </>
        )}

        {stato === CategoryStates.IN_ATTESA_DI_AVVIO && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Ordine di esecuzione confermato. La categoria è pronta per essere avviata.
          </Alert>
        )}
      </Paper>

      {/* Tabella ordine atleti */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          <b>Ordine di Esecuzione Atleti</b>
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>#</b></TableCell>
                <TableCell><b>Cognome</b></TableCell>
                <TableCell><b>Nome</b></TableCell>
                <TableCell><b>Club</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedAthletes.map((atleta, idx) => (
                <TableRow key={atleta.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{atleta.cognome}</TableCell>
                  <TableCell>{atleta.nome}</TableCell>
                  <TableCell>{atleta.club?.denominazione || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default QuyenDefinition;
