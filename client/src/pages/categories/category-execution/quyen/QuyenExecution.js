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
  Divider,
  Alert
} from '@mui/material';
import { CategoryStates } from '../../../../constants/enums/CategoryEnums';
import AuthComponent from '../../../../components/AuthComponent';
import Button from '../../../../components/common/Button';
import ConfirmActionModal from '../../../../components/common/ConfirmActionModal';

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
  stato,
  onPunteggioChange,
  onCommissioneChange,
  onStartCategory,
  onConcludeCategory
}) => {
  const [localClassifica, setLocalClassifica] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmingConcludeDialogOpen, setIsConfirmingConcludeDialogOpen] = useState(false);
  const [spareggi, setSpareggi] = useState({});
  const [error, setError] = useState('');

  const canEdit = stato === CategoryStates.IN_CORSO || isEditMode;

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

  // Calcola il totale modificato (escludendo voto più alto e più basso)
  const getTotaleModificato = (arr) => {
    const nums = (arr || []).map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (nums.length < 3) return '';
    
    const sorted = [...nums].sort((a, b) => a - b);
    // Rimuovi il primo (più basso) e l'ultimo (più alto)
    const middle = sorted.slice(1, -1);
    return middle.reduce((a, b) => a + b, 0).toFixed(1);
  };

  // Calcola il totale (somma di tutti i voti)
  const getTotale = (arr) => {
    const nums = (arr || []).map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (nums.length === 0) return '';
    return nums.reduce((a, b) => a + b, 0).toFixed(1);
  };

  // Calcola classifica automaticamente quando cambiano i punteggi o gli spareggi
  useEffect(() => {
    const listaQuyen = orderAthletesByKeyLetter(atleti, letter).map(a => ({
      totaleModificato: parseFloat(getTotaleModificato(punteggi[a.id])),
      atleta: {
        id: a?.id,
        nome: a?.nome,
        cognome: a?.cognome,
        club: a?.club || null
      }
    })).filter(x => !isNaN(x.totaleModificato));

    const nuovaClassifica = computeQuyenPodium(listaQuyen, spareggi);
    setLocalClassifica(nuovaClassifica);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [punteggi, atleti, letter, spareggi]);

  const computeQuyenPodium = (listaQuyen, spareggiData) => {
    if (!Array.isArray(listaQuyen)) return [];

    const ordinati = [...listaQuyen].sort((a, b) => b.totaleModificato - a.totaleModificato);
    
    // Verifica se ci sono spareggi in corso per i primi 3 posti
    const atletiInSpareggio = atletiInParita();
    const hasSpareggiInCorso = atletiInSpareggio.length > 0;
    
    if (hasSpareggiInCorso) {
      // Verifica se tutti gli spareggi sono stati compilati
      const tuttiSpareggiCompilati = atletiInSpareggio.every(a => spareggiData[a.atletaId]);
      
      if (!tuttiSpareggiCompilati) {
        return [];
      }
      
      // Tutti gli spareggi sono compilati, riordina usando gli spareggi
      const ordinatiConSpareggio = ordinati.map(o => ({
        ...o,
        spareggio: spareggiData[o.atleta.id] ? parseInt(spareggiData[o.atleta.id]) : 999
      })).sort((a, b) => {
        // Prima ordina per totale modificato
        if (b.totaleModificato !== a.totaleModificato) {
          return b.totaleModificato - a.totaleModificato;
        }
        // In caso di parità, ordina per spareggio (1, 2, 3)
        return a.spareggio - b.spareggio;
      });
      
      const classifica = [];
      if (ordinatiConSpareggio[0]) classifica.push({ pos: 1, atletaId: ordinatiConSpareggio[0].atleta.id, totale: ordinatiConSpareggio[0].totaleModificato });
      if (ordinatiConSpareggio[1]) classifica.push({ pos: 2, atletaId: ordinatiConSpareggio[1].atleta.id, totale: ordinatiConSpareggio[1].totaleModificato });
      if (ordinatiConSpareggio[2]) classifica.push({ pos: 3, atletaId: ordinatiConSpareggio[2].atleta.id, totale: ordinatiConSpareggio[2].totaleModificato });
      return classifica;
    }

    // Nessuno spareggio in corso
    const classifica = [];
    if (ordinati[0]) classifica.push({ pos: 1, atletaId: ordinati[0].atleta.id, totale: ordinati[0].totaleModificato });
    if (ordinati[1]) classifica.push({ pos: 2, atletaId: ordinati[1].atleta.id, totale: ordinati[1].totaleModificato });
    if (ordinati[2]) classifica.push({ pos: 3, atletaId: ordinati[2].atleta.id, totale: ordinati[2].totaleModificato });

    return classifica;
  };

  // Verifica se ci sono atleti in parità per i primi 3 posti
  const atletiInParita = () => {
    const listaQuyen = orderAthletesByKeyLetter(atleti, letter).map(a => ({
      totaleModificato: parseFloat(getTotaleModificato(punteggi[a.id])),
      atletaId: a.id
    })).filter(x => !isNaN(x.totaleModificato));

    const ordinati = [...listaQuyen].sort((a, b) => b.totaleModificato - a.totaleModificato);
    
    // Controlla parità per i primi 3 posti
    const pariAtleti = [];
    const postiAssegnati = new Set();
    
    for (let i = 0; i < Math.min(3, ordinati.length); i++) {
      const currentTotal = ordinati[i].totaleModificato;
      const gruppo = ordinati.filter(a => a.totaleModificato === currentTotal);
      
      if (gruppo.length > 1) {
        // Determina il posto per cui competono (1°, 2°, o 3°)
        let posto = i + 1;
        // Se questo totale è già stato processato, salta
        if (postiAssegnati.has(currentTotal)) continue;
        postiAssegnati.add(currentTotal);
        
        gruppo.forEach(g => {
          if (!pariAtleti.find(p => p.atletaId === g.atletaId)) {
            pariAtleti.push({
              atletaId: g.atletaId,
              posto: posto
            });
          }
        });
      }
    }
    
    return pariAtleti;
  };

  const getAtletaById = (id) => {
    return atleti.find(a => a.id === id) || null;
  };

  const handleSpareggio = (atletaId, value) => {
    // Accetta solo 1, 2, 3, 4, 5 o vuoto
    if (value === '' || ['1', '2', '3', '4', '5'].includes(value)) {
      setSpareggi(prev => ({ ...prev, [atletaId]: value }));
    }
  };

  const handleStartCategory = async () => {
    if (onStartCategory) {
      await onStartCategory();
    }
  };

  const handleConcludeCategory = async () => {
    if (onConcludeCategory) {
      // Calcola la classifica finale prima di concludere
      const listaQuyen = orderAthletesByKeyLetter(atleti, letter).map(a => ({
        totaleModificato: parseFloat(getTotaleModificato(punteggi[a.id])),
        atleta: {
          id: a?.id,
          nome: a?.nome,
          cognome: a?.cognome,
          club: a?.club || null
        }
      })).filter(x => !isNaN(x.totaleModificato));

      const classificaFinale = computeQuyenPodium(listaQuyen, spareggi);
      if (classificaFinale.length === 0) {
        setError('Non è possibile concludere la categoria: la classifica non è completa. Assicurati di aver inserito tutti i punteggi e gli spareggi necessari.');
        return;
      }

      await onConcludeCategory(classificaFinale);
      setError('');
      setIsEditMode(false);
    }
  };

  const handleConfirmConclude = () => {
    setIsConfirmingConcludeDialogOpen(true);
  }

  const orderedAthletes = orderAthletesByKeyLetter(atleti, letter);
  const atletiPari = atletiInParita();
  const hasParita = atletiPari.length > 0;
  
  // Helper per trovare il posto di un atleta in parità
  const getPostoSpareggio = (atletaId) => {
    const atleta = atletiPari.find(a => a.atletaId === atletaId);
    return atleta ? atleta.posto : null;
  };

  return (
    <div className="page-grid-75-25">
      {/* Tabella Punteggi - Sinistra */}
      <div className="page-card-with-external-title page-card-expanded">
        <div className="page-card-scrollable">
          <div className="page-card-scrollable-body" style={{ padding: '1rem' }}>

            <Typography variant="h6" gutterBottom>
              Tabella Punteggi {letter ? `(Lettera: ${letter})` : ''}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>#</b></TableCell>
                    <TableCell><b>Atleta</b></TableCell>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <TableCell key={n} align="center"><b>Voto {n}</b></TableCell>
                    ))}
                    <TableCell align="center"><b>Totale</b></TableCell>
                    <TableCell align="center"><b>Spareggio</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderedAthletes.map((atleta, idx) => {
                    const isInParita = atletiPari.some(a => a.atletaId === atleta.id);
                    const postoSpareggio = getPostoSpareggio(atleta.id);
                    return (
                      <TableRow key={atleta.id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            <b>{atleta.cognome}</b> {atleta.nome}
                          </Typography>
                          <Typography variant="body2">
                            {atleta.club?.abbreviazione || atleta.club?.denominazione || '-'}
                          </Typography>
                        </TableCell>
                        {[0, 1, 2, 3, 4].map((vIdx) => (
                          <TableCell key={vIdx} align="center">
                            <TextField
                              type="number"
                              inputProps={{ 
                                min: 6.0, 
                                max: 9.9, 
                                step: 0.1,
                                style: { textAlign: 'center' }
                              }}
                              value={punteggi[atleta.id]?.[vIdx] || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (e.target.value === '' || (val >= 6.0 && val <= 9.9)) {
                                  onPunteggioChange(atleta.id, vIdx, e.target.value);
                                }
                              }}
                              size="small"
                              sx={{ width: '70px', minWidth: '70px', maxWidth: '70px' }}
                              disabled={!canEdit}
                            />
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {getTotaleModificato(punteggi[atleta.id])}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getTotale(punteggi[atleta.id])}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {hasParita && isInParita && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {postoSpareggio}° posto
                              </Typography>
                              <TextField
                                type="text"
                                inputProps={{ 
                                  maxLength: 1,
                                  style: { textAlign: 'center' }
                                }}
                                value={spareggi[atleta.id] || ''}
                                onChange={(e) => handleSpareggio(atleta.id, e.target.value)}
                                size="small"
                                sx={{ minWidth: '50px', maxWidth: '50px' }}
                                disabled={!canEdit || !hasParita}
                                placeholder="-"
                              />
                            </Box>
                          )}
                          {(hasParita && !isInParita) && (
                            <Typography variant="body2" color="text.disabled">
                              N.Q.
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {isEditMode && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Attenzione, e' necessario concludere la categoria per salvare le modifiche alla classifica.
              </Alert>
            )}

            {/* Pulsanti azioni */}
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

      {/* Sidebar: Classifica e Commissione - Destra */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Classifica */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Classifica
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell/>
                  <TableCell><b>Atleta</b></TableCell>
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
                          <div>
                            <Typography variant="body2">
                              <b>{atletaObj.cognome}</b> {atletaObj.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {atletaObj?.club?.abbreviazione || atletaObj?.club?.denominazione || '-'}
                            </Typography>
                          </div>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
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
                  disabled={!canEdit}
                  placeholder="Nome e Cognome"
                />
              </Box>
            ))}
          </Box>
        </Paper>

        <ConfirmActionModal 
          open={isConfirmingConcludeDialogOpen}
          onClose={() => setIsConfirmingConcludeDialogOpen(false)}
          title="Conferma conclusione categoria"
          message="Sei sicuro di voler concludere la categoria? Questa azione è irreversibile e salverà la classifica finale."
          primaryButton={{
            text: 'Concludi',
            onClick: async () => { await handleConcludeCategory(); setIsConfirmingConcludeDialogOpen(false); },
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setIsConfirmingConcludeDialogOpen(false),
          }}
        />
      </div>
    </div>
  );
};

export default QuyenExecution;
