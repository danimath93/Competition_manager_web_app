import React, { useMemo, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import { Paper, Tooltip, Chip } from '@mui/material';
import { PersonRemove, Edit } from '@mui/icons-material';
import { loadCategoryTypeById } from '../api/config';
import RegistrationModal from './RegistrationModal';
import ConfirmActionModal from './common/ConfirmActionModal';

const RegisteredAthletesTable = ({ registrations, competition, isClubRegistered, onRegistrationChange, onDeleteAthlete }) => {
  const [categoryDetailsCache, setCategoryDetailsCache] = useState({});
  const [selectedAthleteForEdit, setSelectedAthleteForEdit] = useState(null);
  const [selectedRegistrationsForEdit, setSelectedRegistrationsForEdit] = useState([]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState(null);
  const [registrationsToDelete, setRegistrationsToDelete] = useState([]);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

  // Estrae le categorie uniche da categorieAtleti
  const categoryColumns = useMemo(() => {
    if (!competition?.categorieAtleti) return [];
    
    const categories = [];
    const categorySet = new Set();

    try {
      // Parsa categorieAtleti che è un array di JSON stringhe
      competition.categorieAtleti.forEach(categorieTipoAtleta => {
        if (categorieTipoAtleta.categorie && Array.isArray(categorieTipoAtleta.categorie)) {
          categorieTipoAtleta.categorie.forEach(cat => {
            if (!categorySet.has(cat.configTipoCategoria)) {
              categorySet.add(cat.configTipoCategoria);
              categories.push({
                id: cat.configTipoCategoria,
                idEsperienza: cat.idEsperienza || []
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Errore nel parsing di categorieAtleti:', error);
    }

    return categories;
  }, [competition?.categorieAtleti]);

  // Carica i dettagli delle categorie
  React.useEffect(() => {
    const loadCategoryDetails = async () => {
      const newCache = { ...categoryDetailsCache };
      
      for (const category of categoryColumns) {
        if (!newCache[category.id]) {
          try {
            const details = await loadCategoryTypeById(category.id);
            newCache[category.id] = details;
          } catch (error) {
            console.error(`Errore nel caricamento categoria ${category.id}:`, error);
            newCache[category.id] = { nome: `Categoria ${category.id}` };
          }
        }
      }
      
      if (Object.keys(newCache).length > Object.keys(categoryDetailsCache).length) {
        setCategoryDetailsCache(newCache);
      }
    };

    if (categoryColumns.length > 0) {
      loadCategoryDetails();
    }
  }, [categoryColumns]);

  // Raggruppa le iscrizioni per atleta
  const athleteGroups = useMemo(() => {
    return registrations.reduce((groups, registration) => {
      const athlete = registration.atleta;
      if (!groups[athlete.id]) {
        groups[athlete.id] = {
          athlete: athlete,
          registrations: [],
          totalCost: 0
        };
      }
      groups[athlete.id].registrations.push(registration);
      
      // Calcola il costo totale per questo atleta
      if (registration.dettagliIscrizione != null) {
        groups[athlete.id].totalCost = parseFloat(registration.dettagliIscrizione.quota) || 0;
      }
      
      return groups;
    }, {});
  }, [registrations]);

  // Definizione delle colonne dinamiche
  const columns = useMemo(() => {
    const cols = [
      // Colonna Atleta (sempre prima)
      {
        field: 'athlete',
        headerName: 'Atleta',
        flex: 1.5,
        minWidth: 180,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => `${row.athlete.cognome} ${row.athlete.nome}`,
        renderCell: (params) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {params.row.athlete.cognome} {params.row.athlete.nome}
            </div>
            {/* <div style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Età: {calculateAge(params.row.athlete.dataNascita)} anni
            </div> */}
          </div>
        ),
      }
    ];

    // Aggiungi colonne per ogni categoria disponibile
    categoryColumns.forEach(category => {
      const categoryDetails = categoryDetailsCache[category.id];
      
      cols.push({
        field: `category_${category.id}`,
        headerName: categoryDetails?.nome || `Categoria ${category.id}`,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        type: 'actions',
        renderCell: (params) => {
          // Trova se l'atleta è iscritto a questa categoria
          const registration = params.row.registrations.find(
            reg => reg.tipoCategoria?.id === category.id
          );
          
          if (registration && registration.dettagli?.nome) {
            return (
              <Tooltip title={`${registration?.dettagli?.nome}`} arrow>
                <Chip
                  label="✓"
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.75rem', height: '20px' }}
                />
              </Tooltip>
            );
          } else if (registration && registration.peso) {
            return (
              <Tooltip title={`Peso: ${registration.peso} kg`} arrow>
                <Chip
                  label="✓"
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.75rem', height: '20px' }}
                />
              </Tooltip>
            );
          } else if (registration) {
            return (
              <Tooltip title="Iscritto" arrow>
                <Chip
                  label="✓"
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.75rem', height: '20px' }}
                />
              </Tooltip>
            );
          }

          return (
            <Chip
              label="-"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem', height: '20px', borderColor: '#e0e0e0' }}
            />
          );
        },
      });
    });

    // Colonna Costo
    cols.push({
      field: 'cost',
      headerName: 'Costo',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: true,
      filterable: false,
      valueGetter: (value, row) => row.totalCost || 0,
      renderCell: (params) => (
        <Chip
          label={`${params.row.totalCost.toFixed(2)} €`}
          color="primary"
          size="small"
        />
      ),
    });

    // Colonna Azioni (sempre ultima)
    if (!isClubRegistered) {
      cols.push({
        field: 'actions',
        type: 'actions',
        headerName: 'Azioni',
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Edit />}
            label="Modifica Iscrizione"
            onClick={() => handleEditRegistration(params.row.athlete, params.row.registrations)}
            showInMenu={true}
          />,
          <GridActionsCellItem
            icon={<PersonRemove />}
            label="Rimuovi Iscrizione"
            onClick={() => handleDeleteClick(params.row.athlete, params.row.registrations)}
            showInMenu={true}
          />,
        ],
      });
    }

    return cols;
  }, [categoryColumns, categoryDetailsCache, isClubRegistered, onDeleteAthlete, onRegistrationChange]);

  // Prepara i dati per la griglia
  const rows = useMemo(() => {
    return Object.values(athleteGroups).map((group, index) => ({
      id: group.athlete.id || index,
      athlete: group.athlete,
      registrations: group.registrations,
      totalCost: group.totalCost,
    }));
  }, [athleteGroups]);

  // Calcola l'età dell'atleta
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Gestisce l'apertura del modale di modifica
  const handleEditRegistration = (athlete, athleteRegistrations) => {
    setSelectedAthleteForEdit(athlete);
    setSelectedRegistrationsForEdit(athleteRegistrations);
    setIsRegistrationModalOpen(true);
  };

  // Gestisce la chiusura del modale di modifica
  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setSelectedAthleteForEdit(null);
    setSelectedRegistrationsForEdit([]);
  };

  // Gestisce il salvataggio delle modifiche (placeholder - da implementare con API)
  const handleSaveRegistration = async () => {
    if (onRegistrationChange) {
      await onRegistrationChange();
    }
    
    handleCloseRegistrationModal();
  };

  // Gestisce il click sul pulsante elimina
  const handleDeleteClick = (athlete, athleteRegistrations) => {
    setAthleteToDelete(athlete);
    setRegistrationsToDelete(athleteRegistrations);
    setIsDeleteConfirmModalOpen(true);
  };

  // Gestisce l'eliminazione confermata
  const handleConfirmDelete = async () => {
    if (onDeleteAthlete) {
      await onDeleteAthlete(athleteToDelete, registrationsToDelete);
    }
        
    setIsDeleteConfirmModalOpen(false);
    setAthleteToDelete(null);
    setRegistrationsToDelete([]);
  };

  // Gestisce l'eliminazione dell'iscrizione dal modale
  const handleDeleteRegistration = async () => {
    if (onDeleteAthlete) {
      await onDeleteAthlete(selectedAthleteForEdit, selectedRegistrationsForEdit);
    }
    
    // Aggiorna la tabella
    if (onRegistrationChange) {
      await onRegistrationChange();
    }
    
    handleCloseRegistrationModal();
  };

  if (rows.length === 0) {
    return (
      <Paper sx={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'text.secondary' }}>
          Nessun atleta iscritto alla competizione
        </div>
      </Paper>
    );
  }

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
            sortModel: [{ field: 'athlete', sort: 'asc' }],
          },
        }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        disableRowSelectionOnClick
        disableColumnMenu={false}
        disableColumnSelector={true}
        localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
        getRowHeight={() => 'auto'}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
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

      {/* Modale per modifica iscrizione */}
      {isRegistrationModalOpen && (
        <RegistrationModal
          open={isRegistrationModalOpen}
          onClose={handleCloseRegistrationModal}
          onSubmit={handleSaveRegistration}
          onDelete={handleDeleteRegistration}
          athlete={selectedAthleteForEdit}
          registrations={selectedRegistrationsForEdit}
          competition={competition}
        />
      )}

      {/* Modale di conferma eliminazione */}
      {isDeleteConfirmModalOpen && (
        <ConfirmActionModal
          open={isDeleteConfirmModalOpen}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          title="Conferma Eliminazione"
          message={`Sei sicuro di voler eliminare l'iscrizione di ${athleteToDelete?.nome} ${athleteToDelete?.cognome}? Verranno eliminate tutte le ${registrationsToDelete?.length || 0} categorie associate.`}
          primaryButton={{
            text: 'Elimina',
            onClick: handleConfirmDelete,
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setIsDeleteConfirmModalOpen(false),
          }}
        />
      )}
    </Paper>
  );
};

export default RegisteredAthletesTable;
