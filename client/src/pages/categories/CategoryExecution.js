import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  Chip
} from '@mui/material';
import MuiButton from '@mui/material/Button';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { itIT } from '@mui/x-data-grid/locales';
import { FaTags } from 'react-icons/fa';
import { PlayArrow, Print, ArrowBack, Person, FormatListNumbered } from '@mui/icons-material';
import { getCategoriesByCompetizione, getCategoriesByTableUser, updateCategoria } from '../../api/categories';
import { startSvolgimentoCategoria } from '../../api/svolgimentoCategorie';
import { getCompetitionDetails } from '../../api/competitions';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadAllCategoryTypes } from '../../api/config';
import { getSvolgimentiByCompetizione } from '../../api/svolgimentoCategorie';
import CategoryNotebookPrint from './print/CategoryNotebookPrint';
import PageHeader from '../../components/PageHeader';
import TableUserSelectorModal from '../../components/TableUserSelectorModal';
import { getTableUsers } from '../../api/auth';
import { CategoryStates } from '../../constants/enums/CategoryEnums';

const CategoryExecution = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const competizioneId = searchParams.get('competizioneId');

  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printCategory, setPrintCategory] = useState(null);
  const [allCategorie, setAllCategorie] = useState([]);
  const [categoryStates, setCategoryStates] = useState({});
  const [showTableUserModal, setShowTableUserModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableUsers, setTableUsers] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderValue, setOrderValue] = useState('');
  const [orderError, setOrderError] = useState('');

  // Verifica se l'utente è admin o superAdmin
  const isAdminOrSuperAdmin = useMemo(() => {
    return user?.permissions === 'admin' || user?.permissions === 'superAdmin';
  }, [user]);

  const isTableUser = useMemo(() => {
    return user?.permissions === 'table';
  }, [user]);

  const getStatusColor = (stato) => {
    switch (stato) {
      case CategoryStates.DA_DEFINIRE:
        return 'default';
      case CategoryStates.IN_DEFINIZIONE:
        return 'info';
      case CategoryStates.IN_ATTESA_DI_AVVIO:
        return 'primary';
      case CategoryStates.IN_CORSO:
        return 'warning';
      case CategoryStates.CONCLUSA:
        return 'success';
      default:
        return 'default';
    }
  };

  const updateCategoryState = (categoriaId, newState) => {
    setCategoryStates((prevStates) => ({
      ...prevStates,
      [categoriaId]: newState
    }));
  }

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setPrintCategory(null);
  };

  const handleGoBack = () => {
    navigate('/categories');
  };

  const handleOpenTableUserModal = (category) => {
    setSelectedCategory(category);
    setShowTableUserModal(true);
  };

  const handleCloseTableUserModal = () => {
    setShowTableUserModal(false);
    setSelectedCategory(null);
  };

  const handleOpenOrderSelectorModal = (category) => {
    setSelectedCategory(category);
    setOrderValue(category.ordine?.toString() || '');
    setOrderError('');
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedCategory(null);
    setOrderValue('');
    setOrderError('');
  };

  const handleConfirmTableUser = async (userId) => {
    try {
      await updateCategoria(selectedCategory.id, { tableUserId: userId });
      // Aggiorna solo lo stato locale invece di ricaricare tutto
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === selectedCategory.id 
            ? { ...cat, tableUserId: userId }
            : cat
        )
      );
      handleCloseTableUserModal();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'utente tavolo:', error);
      setError('Errore nell\'aggiornamento dell\'utente tavolo');
    }
  };

  const handleConfirmOrder = async () => {
    const orderNum = parseInt(orderValue, 10);
    
    // Validazione
    if (!orderValue || isNaN(orderNum)) {
      setOrderError('Inserire un numero valido');
      return;
    }
    
    if (orderNum < 1 || orderNum > 999) {
      setOrderError('Il numero deve essere compreso tra 1 e 999');
      return;
    }

    try {
      await updateCategoria(selectedCategory.id, { ordine: orderNum });
      // Aggiorna solo lo stato locale invece di ricaricare tutto
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === selectedCategory.id 
            ? { ...cat, ordine: orderNum }
            : cat
        )
      );
      handleCloseOrderModal();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'ordine:', error);
      setOrderError('Errore nell\'aggiornamento dell\'ordine');
    }
  };

  // Definizione delle colonne
  const columns = useMemo(() => {

    const getName = (id) => {
      const tipo = allCategorie.find((cat) => cat.id === id);
      if (tipo) return tipo.nome;
      return null;
    };

    const handlePlay = async (cat) => {
      const res = await startSvolgimentoCategoria({categoriaId: cat.id, competizioneId});
      const pageParameters = "svolgimentoId=" + res?.svolgimentoId +
        "&categoriaNome=" + encodeURIComponent(cat?.nome) +
        "&competizioneId=" + competizioneId +
        "&tipoCompetizioneId=" + cat?.tipoCategoria?.tipoCompetizione?.id;
      // Voglio aprire la pagina in una nuova scheda
      updateCategoryState(cat.id, res?.stato);
      window.open(`/category-execution/${cat.id}/category-in-progress?${pageParameters}`, '_blank');
    };

    const handlePrintCategory = async (cat) => {
      const res = await startSvolgimentoCategoria({ categoriaId: cat.id, competizioneId });
      updateCategoryState(cat.id, res?.stato);
      setPrintCategory(cat);
      setShowPrintModal(true);
    };

    const baseColumns = [
      {
        field: 'nome',
        headerName: 'Nome',
        flex: 2,
        minWidth: 120,
        filterable: true,
        sortable: true,
      },
      {
        field: 'tipoCategoriaId',
        headerName: 'Tipologia',
        flex: 2,
        minWidth: 120,
        filterable: true,
        sortable: true,
        valueGetter: (value, row) => getName(row.tipoCategoriaId) || 'N/A',
      },
      {
        field: 'genere',
        headerName: 'Genere',
        flex: 1,
        minWidth: 120,
        align: 'center',
        headerAlign: 'center',
        filterable: true,
        sortable: false,
      },
      {
        field: 'ordine',
        headerName: 'Ordine',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        filterable: true,
        sortable: true,
      },
      {
        field: 'stato',
        headerName: 'Stato',
        flex: 2,
        minWidth: 120,
        align: 'center',
        headerAlign: 'center',
        type: 'actions',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Tooltip title={categoryStates[params.row.id] || CategoryStates.DA_DEFINIRE} arrow>
              <Chip 
                label={categoryStates[params.row.id] || CategoryStates.DA_DEFINIRE}
                color={getStatusColor(categoryStates[params.row.id] || CategoryStates.DA_DEFINIRE)}
                size="small"
              />
            </Tooltip>
          );
        },
      },
    ];

    // Aggiungi colonna Tavolo per admin e superAdmin
    if (isAdminOrSuperAdmin) {
      baseColumns.push({
        field: 'tableUserId',
        headerName: 'Tavolo',
        flex: 1.5,
        minWidth: 140,
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        filterable: false,
        renderCell: (params) => {
          const tableUser = tableUsers.find(u => u.id === params.row.tableUserId);
          return tableUser ? tableUser.username : '-';
        },
      });
    }

    // Colonna Azioni
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      flex: 0.5,
      minWidth: 80,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<PlayArrow />}
            label="Avvia svolgimento"
            onClick={() => handlePlay(params.row)}
            showInMenu={true}
          />,
          <GridActionsCellItem
            icon={<Print />}
            label="Stampa quaderno di gara"
            onClick={() => handlePrintCategory(params.row)}
            showInMenu={true}
          />,
        ];

        // Aggiungi azione per selezionare utente tavolo solo per admin/superAdmin
        if (isAdminOrSuperAdmin) {
          actions.push(
            <GridActionsCellItem
              icon={<Person />}
              label="Seleziona utente tavolo"
              onClick={() => handleOpenTableUserModal(params.row)}
              showInMenu={true}
            />
          );
          actions.push(
            <GridActionsCellItem
              icon={<FormatListNumbered />}
              label="Imposta l'ordine esecuzione"
              onClick={() => handleOpenOrderSelectorModal(params.row)}
              showInMenu={true}
            />
          );
        }

        return actions;
      },
    });

    return baseColumns;
  }, [allCategorie, categoryStates, competizioneId, isAdminOrSuperAdmin, tableUsers]);

    useEffect(() => {

    const loadCompetition = async () => {
      try {
        const data = await getCompetitionDetails(competizioneId);
        setCompetition(data);
      } catch (e) {
        setError('Impossibile caricare la competizione');
      }
    };

    const loadCategories = async () => {
      try {
        setLoading(true);
        if (isTableUser) {
          const data = await getCategoriesByTableUser(competizioneId);
          setCategories(data);
          return;
        } else {
          const data = await getCategoriesByCompetizione(competizioneId, false);
          setCategories(data);
        }
      } catch (e) {
        setError('Impossibile caricare le categorie');
      } finally {
        setLoading(false);
      }
    };

    const loadCategoryType = async () => {
      try {
        const [categorie] = await Promise.all([
          loadAllCategoryTypes(),
        ]);
        setAllCategorie(categorie || []);
      } catch (error) {
        console.error('Errore nel caricamento dei config:', error);
      }
    };

    const loadCategoryStates = async () => {
      try {
        const svolgimenti = await getSvolgimentiByCompetizione(competizioneId);
        const statesMap = {};
        svolgimenti.forEach(svolg => {
          if (svolg.categoriaId) {
            statesMap[svolg.categoriaId] = svolg.stato || CategoryStates.DA_DEFINIRE;
          }
        });
        setCategoryStates(statesMap);
      } catch (error) {
        console.error('Errore nel caricamento degli stati:', error);
      }
    };

    const loadTableUsers = async () => {
      try {
        const response = await getTableUsers();
        setTableUsers(response.users || []);
      } catch (error) {
        console.error('Errore nel caricamento degli utenti tavolo:', error);
      }
    };

    if (!competizioneId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }
    loadCompetition();
    loadCategories();
    loadCategoryType();
    loadCategoryStates();
    if (isAdminOrSuperAdmin) {
      loadTableUsers();
    }
  }, [competizioneId, isAdminOrSuperAdmin]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTags}
        title="Svolgimento categorie"
        subtitle={`${competition?.nome} - Organizzatore: ${competition?.organizzatore?.denominazione || 'N/A'}`}
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna alle Competizioni
      </MuiButton>
    
      {/* Lista categorie */}
      <Paper sx={{ width: '100%', height: '100%', p:3 }}>
        <Typography variant="h6" gutterBottom>
          Categorie definite
        </Typography>
        
        {categories.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nessuna categoria trovata per questa competizione.
          </Typography>
        )}
        {categories.length > 0 && (
          <DataGrid
            rows={categories}
            columns={columns}
            disableColumnMenu={false}
            localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
          />
        )}
      </Paper>

      {/* Competition Notebook Print Modal */}
      <CategoryNotebookPrint
        open={showPrintModal}
        onClose={() => { handleClosePrintModal(); }}
        category={printCategory}
      />

      {/* Table User Selector Modal */}
      <TableUserSelectorModal
        open={showTableUserModal}
        onClose={handleCloseTableUserModal}
        onConfirm={handleConfirmTableUser}
        currentUserId={selectedCategory?.tableUserId}
      />

      {/* Order Selector Modal */}
      <Dialog open={showOrderModal} onClose={handleCloseOrderModal} maxWidth="xs" fullWidth>
        <DialogTitle>
          Imposta ordine di esecuzione
          {selectedCategory && (
            <Typography variant="body2" color="text.secondary">
              {selectedCategory.nome}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ordine di esecuzione"
            type="number"
            fullWidth
            variant="outlined"
            value={orderValue}
            onChange={(e) => {
              setOrderValue(e.target.value);
              setOrderError('');
            }}
            error={!!orderError}
            helperText={orderError}
            inputProps={{
              min: 1,
              max: 999,
              step: 1
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirmOrder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderModal}>Annulla</Button>
          <Button onClick={handleConfirmOrder} variant="contained" color="primary">
            Conferma
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryExecution;