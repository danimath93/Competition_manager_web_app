import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Info, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';

const AthletesTable = ({ athletes, onInfo, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Cognome</TableCell>
            <TableCell>Data di Nascita</TableCell>
            <TableCell>Grado</TableCell>
            <TableCell>Azioni</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {athletes.map((athlete) => (
            <TableRow key={athlete.id}>
              <TableCell>{athlete.nome}</TableCell>
              <TableCell>{athlete.cognome}</TableCell>
              <TableCell>
                {format(new Date(athlete.dataNascita), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{athlete.grado}</TableCell>
              <TableCell>
                <IconButton onClick={() => onInfo(athlete)}>
                  <Info />
                </IconButton>
                <IconButton onClick={() => onEdit(athlete)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(athlete.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AthletesTable;
