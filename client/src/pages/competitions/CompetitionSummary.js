import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { itIT } from '@mui/x-data-grid/locales';
import { Tooltip, Chip, Box, Container, CircularProgress, Alert, IconButton } from '@mui/material';
import { ArrowBack, Description} from '@mui/icons-material';
import MuiButton from '@mui/material/Button';
import { FaTrophy } from 'react-icons/fa';
import { format } from 'date-fns';
import { getCompetitionDetails, getClubCompetitionRegistrationSummary } from '../../api/competitions';
import { loadCategoryTypeById } from '../../api/config';
import { getStatoCertificato, downloadCertificato } from '../../api/certificati';
import {
  getClubRegistrationsByCompetition,
  loadRegistrationsByCompetition,
  downloadClubRegistrationDocument,
} from '../../api/registrations';
import PageHeader from '../../components/PageHeader';
import Tabs from '../../components/common/Tabs';
import muiTheme from '../../styles/muiTheme';


const CompetitionSummary = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [clubRegistrations, setClubRegistrations] = useState([]);
  const [athleteRegistrations, setAthleteRegistrations] = useState([]);
  const [categoryDetailsCache, setCategoryDetailsCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('administrative');

  // Configurazione dei tabs
  const summaryTabs = [
    { label: 'Amministrativo', value: 'administrative', disabled: false },
    { label: 'Tecnico', value: 'technical', disabled: false }
  ];

  const handleGoBack = () => {
    navigate('/competitions');
  };

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  const handleDownloadCertificato = async (athlete) => {
    try {
      const blob = await downloadCertificato(athlete.id);
      const url = window.URL.createObjectURL(blob);
      const fileType = blob.type || 'application/pdf';
      const fileExtension = fileType.split('/')[1] || 'pdf';
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificato_${athlete.cognome}_${athlete.nome}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il download del certificato');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carica i dettagli della competizione
        const competitionData = await getCompetitionDetails(competitionId);
        setCompetition(competitionData);

        // Carica le iscrizioni dei club
        const clubRegs = await getClubRegistrationsByCompetition(competitionId);

        // Aggiungo il riepilogo costi e totali iscrizione per club
        const clubRegsWithSummary = await Promise.all(clubRegs.map(async (clubReg) => {
          try {
            const summary = await getClubCompetitionRegistrationSummary(competitionId, clubReg.clubId);
            return { ...clubReg, summary };
          } catch (err) {
            console.warn(`Errore nel caricamento del riepilogo per il club ${clubReg.clubId}:`, err);
            return { ...clubReg, summary: null };
          } 
        }));
        setClubRegistrations(clubRegsWithSummary);

        // Carica tutte le iscrizioni degli atleti
        const athleteRegs = await loadRegistrationsByCompetition(competitionId);
        setAthleteRegistrations(athleteRegs);

      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError('Errore nel caricamento dei dati della competizione: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [competitionId]);

    // Raggruppa le iscrizioni per atleta
  const athleteGroups = useMemo(() => {
    return athleteRegistrations.reduce((groups, registration) => {
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
  }, [athleteRegistrations]);

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
  useEffect(() => {
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
  
  // Definizione delle colonne tabella amministrativa
  const administrativeTableColumns = useMemo(() => {
    const handleDownloadDocument = async (clubId, documentType, fileName) => {
      try {
        const blob = await downloadClubRegistrationDocument(clubId, competitionId, documentType);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `${documentType}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError(err.response?.data?.message || `Errore durante il download del documento: ${documentType}`);
      }
    };

    const baseColumns = [
      {
        field: 'club',
        headerName: 'Club',
        flex: 1,
        minWidth: 150,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => row.club?.denominazione || 'N/A',
      },
      {
        field: 'stato',
        headerName: 'Stato',
        flex: 1,
        minWidth: 120,
        renderCell: (params) => {
          return (
            <Tooltip title={`${params?.row?.stato}`} arrow>
              <Chip
                size="small"
                label={params?.row?.stato || 'N/A'}
                color={
                  params.value === 'Confermata'
                    ? 'success'
                    : params.value === 'In attesa'
                      ? 'warning'
                      : 'default'
                }
              />
            </Tooltip>
          );
        },
      },
      {
        field: 'iscritti',
        headerName: 'Atleti iscritti',
        flex: 1,
        minWidth: 150,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => {
        },
        renderCell: (params) => {
          const cbBambini = params.row.summary?.athleteTypeTotals?.['CB Bambini']?.total || 0;
          const cbAdulti = params.row.summary?.athleteTypeTotals?.['CB Adulti']?.total || 0;
          const cn = params.row.summary?.athleteTypeTotals?.['CN']?.total || 0;
          return (
            <Tooltip title={`CB Bambini: ${cbBambini}, CB Adulti: ${cbAdulti}, CN: ${cn}`} arrow>
              {cbBambini + cbAdulti + cn}
            </Tooltip>
          );
        },
      },
      {
        field: 'categorie',
        headerName: 'Categorie',
        flex: 1,
        minWidth: 150,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => {
        },
        renderCell: (params) => {
          // TODO: da inserire il conteggio delle categorie
          return (
            <Tooltip title={`N/A`} arrow>
              N/A
            </Tooltip>
          );
        },
      },
      {
        field: 'confermaPresidente',
        headerName: 'Conferma Presidente',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        type: 'actions',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const hasFile = !!params.row.confermaPresidenteId;
          const iconStyle = {
            fontSize: 28,
            color: hasFile ? '#4caf50' : '#9e9e9e'
          };
          return (
            <Tooltip title={hasFile ? "Conferma Presidente disponibile" : "Nessuna Conferma Presidente"} arrow>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                if (hasFile) {
                  handleDownloadDocument(params.row?.club?.id, 'confermaPresidente', `conferma_presidente_${params.row.club.denominazione}.pdf`);
                }
              }}>
                <Description sx={iconStyle} />
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        field: 'bonifico',
        headerName: 'Bonifico',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        type: 'actions',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const hasFile = !!params.row.bonificoId;
          const iconStyle = {
            fontSize: 28,
            color: hasFile ? '#4caf50' : '#9e9e9e'
          };
          return (
            <Tooltip title={hasFile ? "Ricevuta bonifico disponibile" : "Nessuna ricevuta bonifico caricata"} arrow>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                if (hasFile) {
                  handleDownloadDocument(params.row?.club?.id, 'bonifico', `bonifico_${params.row.club.denominazione}.pdf`);
                }
              }}>
                <Description sx={iconStyle} />
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        field: 'quota',
        headerName: 'Quota Dovuta (€)',
        width: 150,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => {
          return row.summary?.totals?.totalCost || 0;
        },
        type: 'number',
        valueFormatter: (params) => {
          return params?.value?.toFixed(2);
        },
      },
    ];

    // Colonna Azioni
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      width: 80,
      getActions: (params) => [
        // <GridActionsCellItem
        //   icon={<Edit />}
        //   label="Modifica"
        //   onClick={() => onEdit(params.row)}
        //   showInMenu={true}
        // />,
      ],
    });
    return baseColumns;
  }, [competitionId]);

  // Definizione delle colonne tabella tecnica
  const technicalTableColumns = useMemo(() => {
    const baseColumns = [
      {
        field: 'club',
        headerName: 'Club',
        flex: 1,
        minWidth: 150,
        filterable: true,
        sortable: true,
        hideable: false,
        valueGetter: (value, row) => row.athlete?.club?.denominazione || 'N/A',
      },
      {
        field: 'athlete',
        headerName: 'Atleta',
        flex: 1.5,
        minWidth: 180,
        filterable: true,
        sortable: true,
        hideable: false,
        valueGetter: (value, row) => `${row.athlete.cognome} ${row.athlete.nome}`,
        renderCell: (params) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {params.row.athlete.cognome} {params.row.athlete.nome}
            </div>
          </div>
        ),
      },
      {
        field: 'dataNascita',
        headerName: 'Data di Nascita',
        flex: 1,
        minWidth: 130,
        filterable: false,
        sortable: true,
        valueGetter: (value, row) => new Date(row.athlete.dataNascita),
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
        valueGetter: (value, row) => row.athlete.tipoAtleta?.nome || 'N/A',
      },
      {
        field: 'sesso',
        headerName: 'Sesso',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        filterable: true,
        sortable: false,
        valueGetter: (value, row) => row.athlete.sesso || 'N/A',
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
          const hasCertificato = !!params.row.athlete.certificatoId;
          const scadenzaCertificato = params.row.athlete.scadenzaCertificato;
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
                if (hasCertificato) {
                  handleDownloadCertificato(params.row.athlete);
                }
              }}>
                <Description sx={iconStyle} />
              </IconButton>
            </Tooltip>
          );
        },
      },
    ];

    // Aggiungi colonne per ogni categoria disponibile
    categoryColumns.forEach(category => {
      const categoryDetails = categoryDetailsCache[category.id];
      
      baseColumns.push({
        field: `category_${category.id}`,
        headerName: categoryDetails?.nome || `Categoria ${category.id}`,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        type: 'number',
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => {
          // Trova l'iscrizione per questa categoria
          const registration = row.registrations.find(
            reg => reg.tipoCategoria?.id === category.id
          );
          
          if (!registration) {
            return null; // Non iscritto: restituisce null (permette filtro "is empty")
          } else if (registration.peso) {
            return registration.peso; // Iscritto con peso: restituisce il peso
          } else {
            return 1; // Iscritto senza peso (forme/quyen): restituisce 1 per permettere il filtro
          }
        },
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
                {registration.peso} kg
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

    // Colonna Azioni
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      width: 80,
      getActions: (params) => [
        // <GridActionsCellItem
        //   icon={<Edit />}
        //   label="Modifica"
        //   onClick={() => onEdit(params.row)}
        //   showInMenu={true}
        // />,
      ],
    });

    return baseColumns;
  }, [categoryColumns, categoryDetailsCache]);

  // Caricamento dati per le griglie
  const administrativeTableRows = useMemo(() => {
    return clubRegistrations.map((clubReg, index) => ({
      ...clubReg,
    }));
  }, [clubRegistrations]); 

  const technicalTableRows = useMemo(() => {
    return Object.values(athleteGroups).map((group, index) => ({
      id: group.athlete.id || index,
      athlete: group.athlete,
      registrations: group.registrations,
      totalCost: group.totalCost,
    }));
  }, [athleteGroups]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title="Riepilogo iscrizioni"
        subtitle={`${competition.nome} - Luogo: ${competition.luogo} - Organizzatore: ${competition.organizzatore?.denominazione || 'N/A'}`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna alle Competizioni
      </MuiButton>
    
      {/* Messaggi di errore e successo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs tabs={summaryTabs} activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Tab Panel - Riepilogo amministrativo */}
        { activeTab === "administrative" && (
          <DataGrid
            rows={administrativeTableRows}
            columns={administrativeTableColumns}
            initialState={{
              ...muiTheme.components.MuiDataGrid.defaultProps.initialState,
              sorting: {
                sortModel: [{ field: 'club.denominazione', sort: 'asc' }],
              },
            }}
            disableColumnMenu={false}
            localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
          />
        )}

        {/* Tab Panel - Riepilogo tecnico */}
        { activeTab === "technical" && (
          <DataGrid
            rows={technicalTableRows}
            columns={technicalTableColumns}
            initialState={{
              ...muiTheme.components.MuiDataGrid.defaultProps.initialState,
              sorting: {
                sortModel: [{ field: 'club.denominazione', sort: 'asc' }],
              },
            }}
            disableColumnMenu={false}
            disableColumnSelector={false}
            localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
          />
        )}
      </Tabs>

    </div>
  );
};

export default CompetitionSummary;
