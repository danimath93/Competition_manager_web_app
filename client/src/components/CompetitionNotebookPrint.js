import React, { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { 
  Print as PrintIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { getCompetitionDetails } from '../api/competitions';
import { getSvolgimentoByCategoriaId } from '../api/svolgimentoCategorie';

const CompetitionNotebookPrint = ({ open, onClose, category }) => {
  const printRef = useRef(null);

  const [competition, setCompetition] = React.useState(null);
  const [athletes, setAthletes] = React.useState([]);
  const [orderedAthletes, setOrderedAthletes] = React.useState([]);
  const [commission, setCommission] = React.useState({});
  const [startLetter, setStartLetter] = React.useState('N/A');

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Quaderno_Gara_${category?.nome || 'Categoria'}`,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!category) return;
      try {
        // Carica dettagli competizione
        const compDetails = await getCompetitionDetails(category.competizioneId);
        setCompetition(compDetails);
        // Carica svolgimento categoria per ottenere atleti
        const svolgimento = await getSvolgimentoByCategoriaId(category.id);
        const sortedAthletes = (svolgimento.atleti || []).sort((a, b) => {
          const surnameA = (a.cognome || '').toUpperCase();
          const surnameB = (b.cognome || '').toUpperCase();
          return surnameA.localeCompare(surnameB);
        });
        setAthletes(sortedAthletes);
        setStartLetter(svolgimento.letteraEstratta || 'N/A');

        // Ordina atleti per cognome
        if (svolgimento.letteraEstratta && svolgimento?.atleti.length > 0) {
          const ordered = orderAthletesByKeyLetter(svolgimento.atleti, svolgimento.letteraEstratta);
          setOrderedAthletes(ordered);
        }
      } catch (error) {
        console.error('Errore caricamento dati quaderno di gara:', error);
      }
    };
    loadData();
  }, [category]);
  
  // TODO: inserire la gestione della commisione caricando i dati necessari

  const orderAthletesByKeyLetter = (atleti, keyLetter) => {
    if (!keyLetter) return atleti;

    // Ordina gli atleti alfabeticamente per cognome
    const orderedAthletes = [...(atleti || [])].sort((a, b) => {
      const nameA = (a.cognome || '').toUpperCase();
      const nameB = (b.cognome || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });

    // Ruota l'array in modo che i primi atleti siano quelli con la lettera estratta
    let orderedByLetter = [];
    let orderIdx = orderedAthletes.findIndex(a => (a.cognome || '').toUpperCase().startsWith(keyLetter.toUpperCase()));
    if (orderIdx !== -1) {
      orderedByLetter = [
        ...orderedAthletes.slice(orderIdx),
        ...orderedAthletes.slice(0, orderIdx)
      ];
    } else {
      // Se la lettera non corrisponde a nessun atleta, prende il primo cognome successivo con la lettera più vicina
      orderIdx = orderedAthletes.findIndex(a => (a.cognome || '').toUpperCase() > keyLetter.toUpperCase());
      orderedByLetter = orderIdx !== -1
        ? [
          ...orderedAthletes.slice(orderIdx),
          ...orderedAthletes.slice(0, orderIdx)
        ] : orderedAthletes;
    }
    return orderedByLetter;
  };

  const getUppercase = (str) => {
    return (str || '').toUpperCase();
  };

  const getUpperLowerCase = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  if (!category) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Quaderno di Gara - {category.nome}</Typography>
          <Button onClick={onClose} size="small">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <style>
          {`
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page-break {
                page-break-before: always;
                break-before: page;
              }
              .MuiBox-root {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              .MuiTableContainer-root {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
            }
          `}
        </style>
        <Box 
          ref={printRef} 
          sx={{ 
            bgcolor: 'white', 
            p: 3,
            '& *': { fontFamily: 'Arial, sans-serif' }
          }}
        >
          {/* PRIMA PAGINA */}
          <Box>
            {/* Intestazione */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: '1.2rem' }}>
                {competition?.nome}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1.0rem', textDecoration: 'underline' }}>
                QUADERNO DI GARA
              </Typography>
              <Typography variant="h5" sx={{ mb: 1, fontSize: '1.0rem' }}>
                Categoria: {category.nome}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Box>

            {/* DUE COLONNE */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* COLONNA SINISTRA - Atleti */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.95rem', textAlign: 'center' }}>
                  Iscrizioni ({athletes.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.200' }}>
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.7rem', p: 0.5 }}>N°</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.7rem', p: 0.5 }}>Cognome Nome</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.7rem', p: 0.5 }}>Associazione</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {athletes.map((athlete, index) => (
                        <TableRow key={athlete.id}>
                          <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>{index + 1}</TableCell>
                          <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>
                            {getUppercase(athlete.cognome)} {getUpperLowerCase(athlete.nome)}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>
                            {athlete.club?.denominazione || 'N/D'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* COLONNA DESTRA - Podio e Commissione */}
              <Box sx={{ flex: 1 }}>
                {/* Sezione Podio */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.95rem', textAlign: 'center' }}>
                    Classifica
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.200' }}>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '15%', fontSize: '0.7rem', p: 0.5 }}>
                            Posizione
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '45%', fontSize: '0.7rem', p: 0.5 }}>
                            Cognome Nome
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '40%', fontSize: '0.7rem', p: 0.5 }}>
                            Associazione
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', bgcolor: '#FFD700', fontSize: '0.7rem', p: 0.5 }}>
                            🥇 1°
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 35, fontSize: '0.65rem', p: 0.5 }}>&nbsp;</TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 35, fontSize: '0.65rem', p: 0.5 }}>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', bgcolor: '#C0C0C0', fontSize: '0.7rem', p: 0.5 }}>
                            🥈 2°
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 35, fontSize: '0.65rem', p: 0.5 }}>&nbsp;</TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 35, fontSize: '0.65rem', p: 0.5 }}>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', bgcolor: '#CD7F32', color: 'white', fontSize: '0.7rem', p: 0.5 }}>
                            🥉 3°
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 35, fontSize: '0.65rem', p: 0.5 }}>&nbsp;</TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 35, fontSize: '0.65rem', p: 0.5 }}>&nbsp;</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Commissione Giudicante */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.95rem', textAlign: 'center' }}>
                    Commissione
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.200' }}>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '15%', fontSize: '0.7rem', p: 0.5 }}>Qualifica</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '45%', fontSize: '0.7rem', p: 0.5 }}>Cognome Nome</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '40%', fontSize: '0.7rem', p: 0.5 }}>Firma</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Capo commissione */}
                        <TableRow>
                          <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', width: '10%', fontSize: '0.65rem', p: 0.3 }}>
                            Capo Commissione
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 25, p: 0.3 }}>&nbsp;</TableCell>
                        </TableRow>

                        {/* Giudici principali */}
                        {[1, 2, 3, 4, 5].map((num) => {
                          const judge = null;
                          return (
                            <TableRow key={`main-${num}`}>
                              <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '0.65rem', p: 0.3 }}>
                                Giudice {num}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>
                                {judge ? `${judge.cognome} ${judge.nome}` : ''}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid black', height: 25, p: 0.3 }}>&nbsp;</TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {/* Giudici riserva */}
                        {[1].map((num) => {
                          const judge = null;
                          return (
                            <TableRow key={`reserve-${num}`}>
                              <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontStyle: 'italic', fontSize: '0.65rem', p: 0.3 }}>
                                Giudice Riserva {num}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>
                                {judge ? `${judge.cognome} ${judge.nome}` : ''}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid black', height: 25, p: 0.3 }}>&nbsp;</TableCell>
                            </TableRow>
                          );
                        })}

                        {/* Tavolo */}
                        {[1, 2].map((num) => {
                          const judge = null;
                          return (
                            <TableRow key={`reserve-${num}`}>
                              <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontStyle: 'italic', fontSize: '0.65rem', p: 0.3 }}>
                                Addetto Tavolo {num}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>
                                {judge ? `${judge.cognome} ${judge.nome}` : ''}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid black', height: 25, p: 0.3 }}>&nbsp;</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* SECONDA PAGINA - Tabelle Punteggi */}
          <Box className="page-break" sx={{ pt: 3 }}>
            {/* Intestazione seconda pagina */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                {category.nome} - Tabella Punteggi
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Box>

            {/* TABELLA UNICA CON ENTRAMBI I TURNI */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.300' }}>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>ID</TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.65rem', p: 0.3 }}>Atleta</TableCell>
                    
                    {/* PRIMO TURNO */}
                    <TableCell colSpan={7} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.200', fontSize: '0.7rem', p: 0.3 }}>
                      PRIMO TURNO
                    </TableCell>
                    
                    {/* SECONDO TURNO */}
                    <TableCell colSpan={7} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.400', fontSize: '0.7rem', p: 0.3 }}>
                      SECONDO TURNO
                    </TableCell>
                    <TableCell rowSpan={2} colSpan={1} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.7rem', p: 0.3 }}>
                      TOTALE FINALE
                    </TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ bgcolor: 'grey.200' }}>
                    {/* Colonne Primo Turno */}
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G4</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G5</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.100', fontSize: '0.6rem', p: 0.2 }}>TOT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.100', fontSize: '0.6rem', p: 0.2 }}>PREF</TableCell>
                    
                    {/* Colonne Secondo Turno */}
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G4</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>G5</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.100', fontSize: '0.6rem', p: 0.2 }}>TOT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.100', fontSize: '0.6rem', p: 0.2 }}>PREF</TableCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {orderedAthletes.map((athlete, index) => (
                    <TableRow key={athlete.id}>
                      <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '0.6rem', p: 0.2 }}>{index + 1}</TableCell>
                      <TableCell sx={{ border: '1px solid black', fontSize: '0.6rem', p: 0.2 }}>
                        {getUppercase(athlete.cognome)} {getUpperLowerCase(athlete.nome)}
                      </TableCell>
                      
                      {/* Primo Turno - 7 celle */}
                      <TableCell sx={{ border: '1px solid black', height: 25, p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.50', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.50', p: 0.2 }}>&nbsp;</TableCell>
                      
                      {/* Secondo Turno - 8 celle */}
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.50', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.50', p: 0.2 }}>&nbsp;</TableCell>
                      <TableCell sx={{ border: '1px solid black', bgcolor: 'primary.light', fontWeight: 'bold', p: 0.2 }}>&nbsp;</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
        <Button 
          onClick={handlePrint} 
          variant="contained" 
          startIcon={<PrintIcon />}
          color="primary"
        >
          Stampa Quaderno
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompetitionNotebookPrint;
