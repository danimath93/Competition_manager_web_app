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
//import { format } from 'date-fns';

const ClubsTable = ({ clubs, onInfo, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Referente</TableCell>
            <TableCell>Città</TableCell>
            <TableCell>Azioni</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clubs.map((club) => (
            <TableRow key={club.id}>
              <TableCell>{club.nome}</TableCell>
              <TableCell>{club.referente}</TableCell>
              <TableCell>{club.citta}</TableCell>
              <TableCell>
                <IconButton onClick={() => onInfo(club)}>
                  <Info />
                </IconButton>
                <IconButton onClick={() => onEdit(club)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(club.id)}>
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

export default ClubsTable;
