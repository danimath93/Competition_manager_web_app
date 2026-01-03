import React, { useMemo } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import { Paper } from '@mui/material';
import { Info, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const AthletesTable = ({ athletes, onInfo, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdminOrSuperAdmin = user?.permissions === 'admin' || user?.permissions === 'superAdmin';

  // Definizione delle colonne
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 120,
        filterable: true,
        sortable: true,
      },
      {
        field: 'cognome',
        headerName: 'Cognome',
        flex: 1,
        minWidth: 120,
        filterable: true,
        sortable: true,
      },
      {
        field: 'dataNascita',
        headerName: 'Data di Nascita',
        flex: 1,
        minWidth: 130,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => new Date(row.dataNascita),
        valueFormatter: (value) => {
          if (!value) return 'N/A';
          return format(new Date(value), 'dd/MM/yyyy');
        },
      },
      {
        field: 'tipoAtleta',
        headerName: 'Tipo Atleta',
        flex: 1,
        minWidth: 130,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => row.tipoAtleta?.nome || 'N/A',
      },
    ];

    // Aggiungi colonna Club solo per admin e superAdmin
    if (isAdminOrSuperAdmin) {
      baseColumns.push({
        field: 'club',
        headerName: 'Club',
        flex: 1,
        minWidth: 150,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => row.club?.denominazione || 'N/A',
      });
    }

    // Colonna Azioni
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Info />}
          label="Info"
          onClick={() => onInfo(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Modifica"
          onClick={() => onEdit(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Elimina"
          onClick={() => onDelete(params.row.id)}
          showInMenu={false}
        />,
      ],
    });

    return baseColumns;
  }, [isAdminOrSuperAdmin, onInfo, onEdit, onDelete]);

  // Prepara i dati per la griglia
  const rows = useMemo(() => {
    return athletes.map(athlete => ({
      ...athlete,
      id: athlete.id || athlete.athleteId, // Assicurati che ci sia un id univoco
    }));
  }, [athletes]);

  return (
    <Paper sx={{ width: '100%', height: 600 }}>
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

export default AthletesTable;
