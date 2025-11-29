import React, { useRef } from 'react';
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

const CompetitionNotebookPrint = ({ open, onClose, category, judges = [] }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Quaderno_Gara_${category?.nome || 'Categoria'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page-break {
          page-break-before: always;
        }
      }
    `,
  });

  if (!category) return null;

  const athletes = category.atleti || [];
  const mainJudges = judges.slice(0, 5);
  const reserveJudges = judges.slice(5, 7);

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
        <Box 
          ref={printRef} 
          sx={{ 
            bgcolor: 'white', 
            p: 3,
            '& *': { fontFamily: 'Arial, sans-serif' }
          }}
        >
          {/* PRIMA PAGINA */}
          <Box sx={{ minHeight: '297mm' }}>
            {/* Intestazione */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                QUADERNO DI GARA
              </Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {category.nome}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>

            {/* Lista Atleti Iscritti */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Atleti Iscritti ({athletes.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.200' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>N°</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Cognome e Nome</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Club</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {athletes.map((athlete, index) => (
                      <TableRow key={athlete.id}>
                        <TableCell sx={{ border: '1px solid black' }}>{index + 1}</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>
                          {athlete.cognome} {athlete.nome}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>
                          {athlete.club?.denominazione || 'N/D'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Sezione Podio */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Podio Finale
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.200' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '25%' }}>
                        Posizione
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>
                        Atleta
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', bgcolor: '#FFD700' }}>
                        🥇 1° Classificato
                      </TableCell>
                      <TableCell sx={{ border: '1px solid black', height: 50 }}>&nbsp;</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', bgcolor: '#C0C0C0' }}>
                        🥈 2° Classificato
                      </TableCell>
                      <TableCell sx={{ border: '1px solid black', height: 50 }}>&nbsp;</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', bgcolor: '#CD7F32', color: 'white' }}>
                        🥉 3° Classificato
                      </TableCell>
                      <TableCell sx={{ border: '1px solid black', height: 50 }}>&nbsp;</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Commissione Giudicante */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Commissione Giudicante
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.200' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Ruolo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Nome Giudice</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Firma</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Giudici principali */}
                    {[1, 2, 3, 4, 5].map((num) => {
                      const judge = mainJudges[num - 1];
                      return (
                        <TableRow key={`main-${num}`}>
                          <TableCell sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                            Giudice {num}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black' }}>
                            {judge ? `${judge.cognome} ${judge.nome}` : ''}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 40 }}>&nbsp;</TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {/* Giudici riserva */}
                    {[1, 2].map((num) => {
                      const judge = reserveJudges[num - 1];
                      return (
                        <TableRow key={`reserve-${num}`}>
                          <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontStyle: 'italic' }}>
                            Riserva {num}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black' }}>
                            {judge ? `${judge.cognome} ${judge.nome}` : ''}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid black', height: 40 }}>&nbsp;</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* SECONDA PAGINA - Tabelle Punteggi */}
          <Box className="page-break" sx={{ minHeight: '297mm', pt: 3 }}>
            {/* Intestazione seconda pagina */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {category.nome} - Tabella Punteggi
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>

            {/* PRIMO TURNO */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, bgcolor: 'grey.200', p: 1 }}>
                PRIMO TURNO
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.300' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '40px' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Atleta</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G1</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G2</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G3</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G4</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G5</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '60px' }}>TOT</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '60px' }}>PREF</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {athletes.map((athlete, index) => (
                      <TableRow key={`t1-${athlete.id}`}>
                        <TableCell sx={{ border: '1px solid black', fontWeight: 'bold' }}>{index + 1}</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>
                          {athlete.cognome} {athlete.nome}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid black', height: 35 }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.100' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.100' }}>&nbsp;</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* SECONDO TURNO */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, bgcolor: 'grey.200', p: 1 }}>
                SECONDO TURNO
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.300' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black', width: '40px' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid black' }}>Atleta</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G1</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G2</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G3</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G4</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '50px' }}>G5</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '60px' }}>TOT</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '60px' }}>PREF</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', width: '70px', bgcolor: 'primary.light', color: 'white' }}>
                        TOTALE FINALE
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {athletes.map((athlete, index) => (
                      <TableRow key={`t2-${athlete.id}`}>
                        <TableCell sx={{ border: '1px solid black', fontWeight: 'bold' }}>{index + 1}</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>
                          {athlete.cognome} {athlete.nome}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid black', height: 35 }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.100' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.100' }}>&nbsp;</TableCell>
                        <TableCell sx={{ border: '1px solid black', bgcolor: 'primary.light', fontWeight: 'bold' }}>&nbsp;</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
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
