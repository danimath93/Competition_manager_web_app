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

const JudgesTable = ({ judges, onInfo, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Cognome</TableCell>
            <TableCell>Data di Nascita</TableCell>
            <TableCell>Esperienza</TableCell>
            <TableCell>Azioni</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {judges.map((judge) => (
            <TableRow key={judge.id}>
              <TableCell>{judge.nome}</TableCell>
              <TableCell>{judge.cognome}</TableCell>
              <TableCell>
                {format(new Date(judge.dataNascita), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{judge.livelloEsperienza}</TableCell>
              <TableCell>
                <IconButton onClick={() => onInfo(judge)}>
                  <Info />
                </IconButton>
                <IconButton onClick={() => onEdit(judge)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(judge.id)}>
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

export default JudgesTable;
