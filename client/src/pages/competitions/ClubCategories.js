import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  ExpandLess,
  FiberManualRecord
} from '@mui/icons-material';
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
  const [categoryNameFilter, setCategoryNameFilter] = useState('');
  const [athleteNameFilter, setAthleteNameFilter] = useState('');
  
  // Stato per espandere/collassare le card
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
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
    applyFilters();
  }, [categories, categoryNameFilter, athleteNameFilter]);

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

  const applyFilters = () => {
    let filtered = [...categories];

    // Filtro per nome categoria
    if (categoryNameFilter) {
      filtered = filtered.filter(cat =>
        cat.nome.toLowerCase().includes(categoryNameFilter.toLowerCase())
      );
    }

    // Filtro per nome atleta
    if (athleteNameFilter) {
      filtered = filtered.filter(cat =>
        cat.atleti.some(atleta => {
          const fullName = `${atleta.nome} ${atleta.cognome}`.toLowerCase();
          return fullName.includes(athleteNameFilter.toLowerCase());
        })
      );
    }

    setFilteredCategories(filtered);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleCard = (categoryId) => {
    setExpandedCards(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Torna a tutte le categorie
        </Button>

        <Typography variant="h4" gutterBottom>
          Categorie del Club
        </Typography>

        {competition && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {competition.nome}
          </Typography>
        )}
      </Box>

      {/* Filtri */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              name="name"
              label="Cerca nome categoria"
              placeholder="Inserisci categoria..."
              variant="outlined"
              fullWidth
              value={categoryNameFilter}
              onChange={(e) => setCategoryNameFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="name"
              label="Cerca per nome/cognome atleta"
              placeholder="Inserisci atleta..."
              variant="outlined"
              fullWidth
              value={athleteNameFilter}
              onChange={(e) => setAthleteNameFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

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
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => toggleCard(category.id)}
                    endIcon={expandedCards[category.id] ? <ExpandLess /> : <ExpandMore />}
                  >
                    {expandedCards[category.id] ? 'Nascondi' : 'Mostra'} Atleti
                  </Button>
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
    </Container>
  );
};

export default ClubCategories;
