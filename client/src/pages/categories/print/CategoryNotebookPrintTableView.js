import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

/**
 * Componente per visualizzare la tabella punteggi per categorie non di combattimento
 * 
 * @param {Array} orderedAthletes - Array di atleti ordinati per il turno
 * @param {Function} getUppercase - Funzione per convertire in maiuscolo
 * @param {Function} getUpperLowerCase - Funzione per formattare nome
 * @returns {JSX.Element}
 */
const CategoryNotebookPrintTableView = ({ orderedAthletes, getUppercase, getUpperLowerCase }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="medium" sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.700' }}>
            <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.8rem', p: 0.3, width: '4%', bgcolor: 'grey.700', color: 'white' }}>ID</TableCell>
            <TableCell rowSpan={2} sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.8rem', p: 0.3, px: 1, width: '20%', bgcolor: 'grey.700', color: 'white' }}>Atleta</TableCell>
            
            {/* PRIMO TURNO */}
            <TableCell colSpan={7} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.700', color: 'white', fontSize: '0.7rem', p: 0.3 }}>
              PRIMO TURNO
            </TableCell>

            {/* SECONDO TURNO */}
            <TableCell colSpan={7} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.700', color: 'white', fontSize: '0.7rem', p: 0.3 }}>
              SECONDO TURNO
            </TableCell>
            <TableCell rowSpan={2} colSpan={1} align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.7rem', p: 0.3, bgcolor: 'grey.500', color: 'white' }}>
              TOTALE
            </TableCell>
          </TableRow>
          
          <TableRow sx={{ bgcolor: 'grey.700' }}>
            {/* Colonne Primo Turno */}
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G1</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G2</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G3</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G4</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G5</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.500', color: 'white', fontSize: '0.6rem', p: 0.2, width: '5%' }}>TOT</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.700', color: 'white', fontSize: '0.6rem', p: 0.2, width: '5%' }}>PREF</TableCell>
            
            {/* Colonne Secondo Turno */}
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G1</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G2</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G3</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G4</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', fontSize: '0.6rem', p: 0.2, width: '4%', bgcolor: 'grey.700', color: 'white' }}>G5</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.500', color: 'white', fontSize: '0.6rem', p: 0.2, width: '5%' }}>TOT</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid black', bgcolor: 'grey.700', color: 'white', fontSize: '0.6rem', p: 0.2, width: '5%' }}>PREF</TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {orderedAthletes.map((athlete, index) => {
            const isEven = index % 2 === 0;
            const rowBgColor = isEven ? 'white' : 'grey.100';
            
            return (
            <TableRow key={athlete.id} sx={{ bgcolor: rowBgColor }}>
              <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', p: 0.15, bgcolor: rowBgColor }}>{index + 1}</TableCell>
              <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', p: 0.15, px: 1, bgcolor: rowBgColor }}>
                {getUppercase(athlete.cognome)} {getUpperLowerCase(athlete.nome)}
              </TableCell>
              
              {/* Primo Turno - 7 celle */}
              <TableCell sx={{ border: '1px solid black', height: 25, p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.300', p: 0.2 }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', bgcolor: rowBgColor, p: 0.2 }}>&nbsp;</TableCell>
              
              {/* Secondo Turno - 8 celle */}
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', p: 0.2, bgcolor: rowBgColor }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.300', p: 0.2 }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', bgcolor: rowBgColor, p: 0.2 }}>&nbsp;</TableCell>
              <TableCell sx={{ border: '1px solid black', bgcolor: 'grey.400', fontWeight: 'bold', p: 0.2 }}>&nbsp;</TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CategoryNotebookPrintTableView;
