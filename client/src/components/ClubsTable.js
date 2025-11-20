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
  Tooltip
} from '@mui/material';
import { Info, Edit, Delete } from '@mui/icons-material';
//import { format } from 'date-fns';

const ClubsTable = ({ clubs, onInfo, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Denominazione</TableCell>
            <TableCell>Codice Fiscale</TableCell>
            <TableCell>Partita IVA</TableCell>
            <TableCell>Legale Rappresentante</TableCell>
            <TableCell>Direttore Tecnico</TableCell>
            <TableCell>Recapito Telefonico</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Azioni</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clubs.map((club) => (
            <TableRow key={club.id + '-' + club.codiceFiscale}>
              <TableCell>{club.denominazione}</TableCell>
              <TableCell>{club.codiceFiscale}</TableCell>
              <TableCell>{club.partitaIva}</TableCell>
              <TableCell>{club.legaleRappresentante}</TableCell>
              <TableCell>{club.direttoreTecnico}</TableCell>
              <TableCell>{club.recapitoTelefonico}</TableCell>
              <TableCell>{club.email}</TableCell>
              <TableCell>
                <Tooltip title="Info Club" arrow>
                  <IconButton onClick={() => onInfo(club)}>
                    <Info />
                  </IconButton>
                </Tooltip>                
                <Tooltip title="Modifica Club" arrow>
                  <IconButton onClick={() => onEdit(club)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Elimina Club" arrow>       
                  <IconButton onClick={() => onDelete(club.id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>                  
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClubsTable;
