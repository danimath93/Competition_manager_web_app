// QuyenDefinition.js
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Alert
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import Button from '../../../../components/common/Button';

/**
 * Componente per la definizione dell'ordine di esecuzione delle forme (Quyen/Armi)
 * Gestisce gli stati: IN_DEFINIZIONE e IN_ATTESA_DI_AVVIO
 */
const QuyenDefinition = ({ 
  atleti, 
  letter, 
  onConfirmDefinition
}) => {
  const [categoryLetter, setCategoryLetter] = useState(letter || '');
  const [error, setError] = useState('');

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
    setCategoryLetter(randomLetter);
  };

  const handleConfirmDefinition = () => {
    if (!categoryLetter) {
      setError('Per favore, imposta una lettera prima di confermare.');
      return;
    }
    onConfirmDefinition(categoryLetter);
    setError('');
  };

  const orderedAthletes = orderAthletesByKeyLetter(atleti, categoryLetter);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Sezione estrazione lettera */}
      <Box sx={{ 
        mb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'flex-start',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2 
      }}>
        <Typography variant="h6" gutterBottom>
          Imposta la lettera per l'ordine di esecuzione della categoria
        </Typography>

        <TextField
          label="Lettera"
          value={categoryLetter}
          onChange={(e) => setCategoryLetter(e.target.value.toUpperCase())}
          inputProps={{ maxLength: 1 }}
        />

        <Tooltip title="Estrai una nuova lettera">
          <Button 
            icon={Refresh}
            onClick={handleGenerateRandomLetter}
            size='s'
          />
        </Tooltip>
      </Box>
      <Button
        variant='success'
        onClick={handleConfirmDefinition}
      >
        Conferma categoria
      </Button>
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
