// QuyenExecution.js
import React, { useEffect, useState } from 'react';
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
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';

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
 * Componente per l'esecuzione e visualizzazione risultati delle forme (Quyen/Armi)
 * Gestisce gli stati: IN_CORSO e CONCLUSA
 */
const QuyenExecution = ({ 
  atleti, 
  letter, 
  punteggi,
  commissione,
  classifica,
  stato,
  onPunteggioChange,
  onCommissioneChange
}) => {
  const [localClassifica, setLocalClassifica] = useState([]);

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

  const getMedia = (arr) => {
    const nums = (arr || []).map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (nums.length === 0) return '';
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  };

  // Calcola classifica automaticamente quando cambiano i punteggi
  useEffect(() => {
    const listaQuyen = orderAthletesByKeyLetter(atleti, letter).map(a => ({
      media: parseFloat(getMedia(punteggi[a.id])),
      atleta: {
        id: a?.id,
        nome: a?.nome,
        cognome: a?.cognome,
        club: a?.club || null
      }
    })).filter(x => !isNaN(x.media));

    const nuovaClassifica = computeQuyenPodium(listaQuyen);
    setLocalClassifica(nuovaClassifica);
  }, [punteggi, atleti, letter]);

  const computeQuyenPodium = (listaQuyen) => {
    if (!Array.isArray(listaQuyen)) return [];

    const ordinati = [...listaQuyen].sort((a, b) => b.media - a.media);

    const classifica = [];
    if (ordinati[0]) classifica.push({ pos: 1, atletaId: ordinati[0].atleta.id });
    if (ordinati[1]) classifica.push({ pos: 2, atletaId: ordinati[1].atleta.id });
    if (ordinati[2]) classifica.push({ pos: 3, atletaId: ordinati[2].atleta.id });

    return classifica;
  };

  const getAtletaById = (id) => {
    return atleti.find(a => a.id === id) || null;
  };

  const orderedAthletes = orderAthletesByKeyLetter(atleti, letter);

  return (
    <Grid container spacing={3}>
      {/* Tabella Punteggi */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tabella Punteggi
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Lettera estratta: <b>{letter || '-'}</b>
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Atleta</b></TableCell>
                  <TableCell><b>Club</b></TableCell>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TableCell key={n} align="center"><b>Voto {n}</b></TableCell>
                  ))}
                  <TableCell align="center"><b>Media</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderedAthletes.map((atleta, idx) => (
                  <TableRow key={atleta.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <b>{atleta.cognome}</b> {atleta.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {atleta.club?.denominazione || '-'}
                      </Typography>
                    </TableCell>
                    {[0, 1, 2, 3, 4].map((vIdx) => (
                      <TableCell key={vIdx} align="center">
                        <TextField
                          type="number"
                          inputProps={{ 
                            min: 0, 
                            max: 9.99, 
                            step: 0.01,
                            style: { textAlign: 'center' }
                          }}
                          value={punteggi[atleta.id]?.[vIdx] || ''}
                          onChange={(e) => onPunteggioChange(atleta.id, vIdx, e.target.value)}
                          size="small"
                          sx={{ width: 70 }}
                          disabled={stato !== CategoryStates.IN_CORSO}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {getMedia(punteggi[atleta.id])}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Sidebar: Classifica e Commissione */}
      <Grid item xs={12} lg={4}>
        {/* Classifica */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Classifica
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {stato === CategoryStates.CONCLUSA && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Categoria conclusa
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Pos.</b></TableCell>
                  <TableCell><b>Atleta</b></TableCell>
                  <TableCell><b>Club</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[0, 1, 2].map((idx) => {
                  const entry = localClassifica[idx];
                  const atletaObj = entry ? getAtletaById(entry.atletaId) : null;
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {idx + 1}°
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {atletaObj ? (
                          <Typography variant="body2">
                            <b>{atletaObj.cognome}</b> {atletaObj.nome}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {atletaObj?.club?.denominazione || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
                  value={commissione[idx] || ''}
                  onChange={(e) => onCommissioneChange(idx, e.target.value)}
                  size="small"
                  fullWidth
                  disabled={stato !== CategoryStates.IN_CORSO}
                  placeholder="Nome e Cognome"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default QuyenExecution;
