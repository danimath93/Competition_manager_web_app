import React, { useMemo } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import { Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const JudgesTable = ({ judges, onEdit, onDelete }) => {

  const { user } = useAuth();
  const isAdminOrSuperAdmin = user?.permissions === 'admin' || user?.permissions === 'superAdmin';

  // Definizione delle colonne
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'cognome',
        headerName: 'Cognome',
        flex: 1,
        minWidth: 120,
        filterable: false,
        sortable: true,
      },
      {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 120,
        filterable: false,
        sortable: true,
      },
      {
        field: 'dataNascita',
        headerName: 'Data di Nascita',
        flex: 1,
        minWidth: 130,
        filterable: false,
        sortable: true,
        valueGetter: (value, row) => new Date(row.dataNascita),
        valueFormatter: (value) => {
          if (!value) return 'N/A';
          return format(new Date(value), 'dd/MM/yyyy');
        },
      },
      {
        field: 'livelloEsperienza',
        headerName: 'Livello di Esperienza',
        flex: 1,
        filterable: true,
        sortable: true,
      },
      {
        field: 'regione',
        headerName: 'Regione',
        flex: 1,
        filterable: true,
        sortable: true,
      },
    ];

    if (isAdminOrSuperAdmin) {
      // TODO: Aggiungi colonna specifiche solo per admin e superAdmin
    }

    // Colonna Azioni
    baseColumns.push({
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
    });

    return baseColumns;
  }, [isAdminOrSuperAdmin, onEdit, onDelete]);

  // Prepara i dati per la griglia
  const rows = useMemo(() => {
    return judges.map(judge => ({
      ...judge,
      id: judge.id || judge.judgeId, // Assicurati che ci sia un id univoco
    }));
  }, [judges]);

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
            sortModel: [{ field: 'cognome', sort: 'asc' }],
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

export default JudgesTable;