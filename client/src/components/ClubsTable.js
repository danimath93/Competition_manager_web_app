import React, { useMemo } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import { Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const ClubsTable = ({ clubs, onEdit, onDelete }) => {
  // Definizione delle colonne
  const columns = useMemo(() => [
    {
      field: 'denominazione',
      headerName: 'Denominazione',
      flex: 1,
      minWidth: 150,
      filterable: false,
      sortable: true,
    },
    {
      field: 'codiceFiscale',
      headerName: 'Codice Fiscale',
      flex: 1,
      minWidth: 130,
      filterable: false,
      sortable: true,
    },
    {
      field: 'partitaIva',
      headerName: 'Partita IVA',
      flex: 1,
      minWidth: 130,
      filterable: false,
      sortable: true,
    },
    {
      field: 'legaleRappresentante',
      headerName: 'Legale Rappresentante',
      flex: 1,
      minWidth: 150,
      filterable: false,
      sortable: true,
    },
    {
      field: 'direttoreTecnico',
      headerName: 'Direttore Tecnico',
      flex: 1,
      minWidth: 150,
      filterable: false,
      sortable: true,
    },
    {
      field: 'recapitoTelefonico',
      headerName: 'Recapito Telefonico',
      flex: 1,
      minWidth: 140,
      filterable: false,
      sortable: false,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      filterable: false,
      sortable: false,
    },
    {
      field: 'tesseramento',
      headerName: 'Affiliazione',
      flex: 1,
      minWidth: 130,
      filterable: false,
      sortable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Modifica"
          onClick={() => onEdit(params.row)}
          showInMenu={true}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Elimina"
          onClick={() => onDelete(params.row.id)}
          showInMenu={true}
        />,
      ],
    },
  ], [onEdit, onDelete]);

  // Prepara i dati per la griglia
  const rows = useMemo(() => {
    return clubs.map(club => ({
      ...club,
      id: club.id,
    }));
  }, [clubs]);

  return (
    <Paper sx={{ width: '100%', height: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
          sorting: {
            sortModel: [{ field: 'denominazione', sort: 'asc' }],
          },
        }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        disableRowSelectionOnClick
        disableColumnMenu={false}
        disableColumnSelector={true}
        localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--bg-secondary, #f8f9fa)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'var(--bg-secondary, #f8f9fa)',
            fontWeight: 600,
          },
        }}
      />
    </Paper>
  );
};

export default ClubsTable;
