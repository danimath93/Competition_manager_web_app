import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { CompetitionTipology } from '../constants/enums/CompetitionEnums';

const { getCategoriesByCompetizione, printCategories, exportCategories } = await import('../api/categories');

const CategorySummaryModal = ({ open, onClose, competitionId }) => {
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalCategories: 0,
    totalAthletes: 0,
    medals: {
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0
    }
  });

  useEffect(() => {
    if (open && competitionId) {
      loadCategorySummary();
    }
  }, [open, competitionId]);

  const loadCategorySummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesData = await getCategoriesByCompetizione(competitionId);
      
      // Calculate summary
      const totalCategories = categoriesData.length;
      let totalAthletes = 0;
      let goldMedals = 0;
      let silverMedals = 0;
      let bronzeMedals = 0;

      categoriesData.forEach(category => {
        const athleteCount = category.maxPartecipanti || 0;
        totalAthletes += athleteCount;

        if (category.tipoCategoria?.tipoCompetizione?.id !== CompetitionTipology.COMPLEMENTARI) {
          // Medal calculation based on number of athletes, only for non dimonstrative categories
          if (athleteCount > 3) {
            goldMedals += 1;
            silverMedals += 1;
            if (category.tipoCategoria?.tipoCompetizione?.id === CompetitionTipology.COMBATTIMENTO) {
              bronzeMedals += 2;
            } else {
              bronzeMedals += 1;
            }
          } else if (athleteCount === 3) { 
            goldMedals += 1;
            silverMedals += 1;
            bronzeMedals += 1;
          } else if (athleteCount === 2) { // No bronze medals
            goldMedals += 1;
            silverMedals += 1;
          } else if (athleteCount === 1) { // No silver or bronze medals
            goldMedals += 1;
          }
        }
      });

      setCategories(categoriesData);
      setSummary({
        totalCategories,
        totalAthletes,
        medals: {
          gold: goldMedals,
          silver: silverMedals,
          bronze: bronzeMedals,
          total: goldMedals + silverMedals + bronzeMedals
        }
      });

    } catch (err) {
      console.error('Errore nel caricamento del riepilogo categorie:', err);
      setError('Impossibile caricare il riepilogo delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const getMedalInfo = (athleteCount, competitionTypeId) => {
    if (competitionTypeId !== CompetitionTipology.COMPLEMENTARI) {
      if (athleteCount > 3) {
        if (competitionTypeId === CompetitionTipology.COMBATTIMENTO) {
          return { gold: 1, silver: 1, bronze: 2 };
        } else {
          return { gold: 1, silver: 1, bronze: 1 };
        }
      } else if (athleteCount === 3) {
        return { gold: 1, silver: 1, bronze: 1 };
      } else if (athleteCount === 2) {
        return { gold: 1, silver: 1, bronze: 0 };
      } else if (athleteCount === 1) {
        return { gold: 1, silver: 0, bronze: 0 };
      }
    }
    return { gold: 0, silver: 0, bronze: 0 };
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);
      await printCategories(competitionId);
    } catch (err) {
      console.error('Errore nella stampa:', err);
      setError('Impossibile stampare le categorie: ' + err.message);
    } finally {
      setPrinting(false);
    }
  };

  const handleExport = async () => {
    try {
      setPrinting(true);
      await exportCategories(competitionId);
    } catch (err) {
      console.error('Errore nell\'export:', err);
      setError('Impossibile esportare le categorie: ' + err.message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Riepilogo Generale Categorie</Typography>
          </Box>
          <Button onClick={onClose} size="small">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Totale Categorie
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.totalCategories}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Totale Iscrizioni Atleti
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.totalAthletes}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, flex: 2, minWidth: 250 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Medaglie Necessarie
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    label={`🥇 ${summary.medals.gold}`} 
                    sx={{ bgcolor: '#FFD700', fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={`🥈 ${summary.medals.silver}`} 
                    sx={{ bgcolor: '#C0C0C0', fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={`🥉 ${summary.medals.bronze}`} 
                    sx={{ bgcolor: '#CD7F32', color: 'white', fontWeight: 'bold' }}
                  />
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="h6">
                    Tot: {summary.medals.total}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Categories Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nome Categoria</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>N° Iscritti</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo Competizione</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Medaglie (🥇/🥈/🥉)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                          Nessuna categoria disponibile
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category, index) => {
                      const athleteCount = category.maxPartecipanti || 0;
                      const medals = getMedalInfo(athleteCount, category.tipoCategoria?.tipoCompetizione?.id);
                      
                      return (
                        <TableRow 
                          key={category.id}
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: athleteCount === 0 ? 'error.50' : 'inherit'
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.nome}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={athleteCount} 
                              size="small"
                              color={athleteCount === 0 ? 'error' : 'primary'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {category.tipoCategoria?.tipoCompetizione?.nome || 'N/D'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {medals.gold} / {medals.silver} / {medals.bronze}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleExport} 
          variant="outlined"
          startIcon={<ExportIcon />}
          disabled={printing || loading}
        >
          {printing ? 'Esportazione in corso...' : 'Esporta'}
        </Button>
        <Button 
          onClick={handlePrint} 
          variant="outlined"
          startIcon={<PrintIcon />}
          disabled={printing || loading}
        >
          {printing ? 'Stampa in corso...' : 'Stampa'}
        </Button>
        <Button onClick={onClose} variant="contained">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategorySummaryModal;
