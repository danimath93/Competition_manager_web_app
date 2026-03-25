import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import { Button as MuiButton } from '@mui/material';
import { FaTags } from 'react-icons/fa';
import {
  ArrowBack,
  ExpandMore,
  ExpandLess,
  FiberManualRecord
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import SearchTextField from '../../components/SearchTextField';
import { useAuth } from '../../context/AuthContext';
import { getCompetitionDetails } from '../../api/competitions';
import { getCategoriesByClub } from '../../api/categories';

const ClubCategories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { competitionId } = useParams();
  const clubId = user?.clubId;

  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtri
  const [clubCategorySearchFilter, setClubCategorySearchFilter] = useState('');
  
  // Stato per espandere/collassare le card
  const [expandedCards, setExpandedCards] = useState({});

  const handleGoBack = () => {
    navigate('/competitions');
  };

  const handleClubCategorySearchFilterChange = (event) => {
    setClubCategorySearchFilter(event.target.value);
  }

  const toggleCard = (categoryId) => {
    setExpandedCards(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carica i dettagli della competizione
        const competitionData = await getCompetitionDetails(competitionId);
        setCompetition(competitionData);

        // Carica le categorie del club
        const categoriesData = await getCategoriesByClub(competitionId, clubId);
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError('Impossibile caricare le categorie');
      } finally {
        setLoading(false);
      }
    };

    if (!competitionId) {
      setError('ID competizione mancante');
      setLoading(false);
      return;
    }

    if (!clubId) {
      setError('Club non identificato. Effettua il login.');
      setLoading(false);
      return;
    }

    loadData();
  }, [competitionId, clubId]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...categories];

      // Filtro per nome categoria
      if (clubCategorySearchFilter) {
        filtered = filtered.filter(cat =>
          cat.nome.toLowerCase().includes(clubCategorySearchFilter.toLowerCase())
        );
      }

      // Filtro per nome atleta
      if (clubCategorySearchFilter) {
        filtered = filtered.filter(cat =>
          cat.atleti.some(atleta => {
            const fullName = `${atleta.nome} ${atleta.cognome}`.toLowerCase();
            return fullName.includes(clubCategorySearchFilter.toLowerCase());
          })
        );
      }

      setFilteredCategories(filtered);
    };

    applyFilters();
  }, [categories, clubCategorySearchFilter]);


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
        icon={FaTags}
        title="Categorie iscritti del Club"
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

      {/* Filtri */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <SearchTextField
          value={clubCategorySearchFilter}
          onChange={handleClubCategorySearchFilterChange}
          placeholder="Filtra per atleta o per nome categoria"
          sx={{
            width: '100%',
            maxWidth: "800px",
            '& .MuiOutlinedInput-root': {
              height: '60px',
            }
          }}
        />
      </Box>

      {/* Lista Categorie */}
      {filteredCategories.length === 0 ? (
        <Alert severity="info">
          {categories.length === 0
            ? 'Nessuna categoria con atleti del tuo club'
            : 'Nessuna categoria trovata con i filtri applicati'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredCategories.map((category) => (
            <Card key={category.id} sx={{ width: '100%' }}>
              <CardContent>
                {/* Header Categoria */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div">
                      {category.nome}
                    </Typography>
                  </Box>
                  <MuiButton
                    variant="outlined"
                    size="small"
                    onClick={() => toggleCard(category.id)}
                    endIcon={expandedCards[category.id] ? <ExpandLess /> : <ExpandMore />}
                  >
                    {expandedCards[category.id] ? 'Nascondi' : 'Mostra'} Atleti
                  </MuiButton>
                </Box>

                {/* Tabella Atleti */}
                {expandedCards[category.id] && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: 50 }}></TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Cognome</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Sesso</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Anno</TableCell>
                          {category.tipoCategoria?.tipoCompetizione?.id === 3 && (
                            <TableCell sx={{ fontWeight: 'bold' }}>Peso (kg)</TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.atleti.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography variant="body2" color="text.secondary">
                                Nessun atleta assegnato
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          category.atleti.map((atleta, index) => (
                            <TableRow 
                              key={atleta.id} 
                              hover
                              sx={{
                                bgcolor: atleta.isMyClub ? 'success.50' : 'inherit',
                                fontWeight: atleta.isMyClub ? 'bold' : 'normal'
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell align="center">
                                {atleta.isMyClub && (
                                  <Tooltip title="Atleta iscritto al club">
                                    <FiberManualRecord sx={{ color: '#4caf50', fontSize: 16 }} />
                                  </Tooltip>
                                )}
                              </TableCell>
                              <TableCell sx={{ fontWeight: atleta.isMyClub ? 'bold' : 'normal' }}>
                                {atleta.cognome}
                              </TableCell>
                              <TableCell sx={{ fontWeight: atleta.isMyClub ? 'bold' : 'normal' }}>
                                {atleta.nome}
                              </TableCell>
                              <TableCell>{atleta.sesso}</TableCell>
                              <TableCell>{new Date(atleta.dataNascita).getFullYear()}</TableCell>
                              {category.tipoCategoria?.tipoCompetizione?.id === 3 && (
                                <TableCell>{atleta.peso || '-'}</TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
};

export default ClubCategories;
