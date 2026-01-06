import React, { useMemo } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import { Paper, Tooltip, IconButton } from '@mui/material';
import { Edit, Delete, Description } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getStatoCertificato } from '../api/certificati';

const AthletesTable = ({ athletes, onEdit, onDelete }) => {
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
        field: 'tipoAtleta',
        headerName: 'Tipo Atleta',
        flex: 1,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => row.tipoAtleta?.nome || 'N/A',
      },
      {
        field: 'sesso',
        headerName: 'Sesso',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        filterable: true,
        sortable: false,
      },
      {
        field: 'certificato',
        headerName: 'Certificato',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        type: 'actions',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const hasCertificato = !!params.row.certificatoId;
          const scadenzaCertificato = params.row.scadenzaCertificato;
          const stato = getStatoCertificato(scadenzaCertificato, hasCertificato);
          
          const iconStyle = {
            fontSize: 28,
            color: stato.colore === 'gray' ? '#9e9e9e' :
                   stato.colore === 'red' ? '#f44336' :
                   stato.colore === 'orange' ? '#ff9800' :
                   stato.colore === 'green' ? '#4caf50' :
                   '#2196f3'
          };

          return (
            <Tooltip title={stato.tooltip} arrow>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                if (hasCertificato && params.row.onDownloadCertificato) {
                  params.row.onDownloadCertificato(params.row);
                } else if (!hasCertificato && params.row.onUploadCertificato) {
                  params.row.onUploadCertificato(params.row);
                }
              }}>
                <Description sx={iconStyle} />
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        field: 'scadenzaCertificato',
        headerName: 'Scadenza Certificato',
        flex: 1,
        width: 150,
        filterable: false,
        sortable: true,
        valueGetter: (value, row) => row.scadenzaCertificato ? new Date(row.scadenzaCertificato) : null,
        valueFormatter: (value) => {
          if (!value) return 'N/A';
          return format(new Date(value), 'dd/MM/yyyy');
        },
      }
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

export default AthletesTable;
