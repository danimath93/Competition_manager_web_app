import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Euro as EuroIcon } from '@mui/icons-material';
import { CompetitionStatus, CompetitionLevel  } from '../constants/enums/CompetitionEnums';
import CompetitionCategoryManager from './CompetitionCategoryManager';
import CostManagementModal from './CostManagementModal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  minWidth: 900,
  maxWidth: 1200,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
};

const CompetitionModal = ({ open, onClose, onSubmit, isEditMode, competition }) => {
  const [formData, setFormData] = useState({});
  const [costModalOpen, setCostModalOpen] = useState(false);

  useEffect(() => {
    if (isEditMode && competition) {
      setFormData({
        id: competition.id,
        nome: competition.nome || '',
        dataInizio: competition.dataInizio ? competition.dataInizio.split('T')[0] : '',
        dataFine: competition.dataFine ? competition.dataFine.split('T')[0] : '',
        tipiCompetizione: competition.tipiCompetizione || [],
        categorieAtleti: competition.categorieAtleti || [],
        livello: competition.livello || '',
        dataScadenzaIscrizioni: competition.dataScadenzaIscrizioni ? competition.dataScadenzaIscrizioni.split('T')[0] : '',
        luogo: competition.luogo || '',
        indirizzo: competition.indirizzo || '',
        stato: competition.stato || CompetitionStatus.PLANNED,
        descrizione: competition.descrizione || '',
        costiIscrizione: competition.costiIscrizione || null,
      });
    } else {
      setFormData({
        nome: '',
        dataInizio: '',
        dataFine: '',
        tipiCompetizione: [],
        categorieAtleti: [],
        livello: CompetitionLevel.REGIONAL,
        stato: CompetitionStatus.PLANNED,
        dataScadenzaIscrizioni: '',
        luogo: '',
        indirizzo: '',
        descrizione: '',
        costiIscrizione: null,
      });
    }
  }, [isEditMode, competition, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoriesChange = (categoriesData) => {
    setFormData({ 
      ...formData, 
      categorieAtleti: categoriesData.categorieAtleti,
      tipiCompetizione: categoriesData.tipiCompetizione || []
    });
  };

  const handleCostsChange = (costiIscrizione, iban) => {
    setFormData({ 
      ...formData, 
      costiIscrizione,
      iban: iban
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validazione: verifica che almeno una categoria atleta sia configurata
    if (!formData.categorieAtleti || formData.categorieAtleti.length === 0) {
      alert('Configura almeno una categoria per gli atleti');
      return;
    }
    
    // Validazione: verifica che ogni tipo atleta abbia almeno una categoria
    const hasInvalidConfig = formData.categorieAtleti.some(ca => 
      !ca.categorie || ca.categorie.length === 0
    );
    
    if (hasInvalidConfig) {
      alert('Ogni tipo di atleta deve avere almeno una categoria configurata');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm" >
      <DialogTitle>{isEditMode ? 'Modifica Competizione' : 'Aggiungi Competizione'}</DialogTitle>
      <form onSubmit={handleSubmit} minWidth={900}>
        <DialogContent>
          <TextField
            name="nome"
            label="Nome Competizione"
            value={formData.nome}
            onChange={handleChange}
            fullWidth
            required
          />
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataInizio"
                label="Data Inizio"
                type="date"
                value={formData.dataInizio}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataFine"
                label="Data Fine"
                type="date"
                value={formData.dataFine}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataScadenzaIscrizioni"
                label="Data Scadenza Iscrizioni"
                type="date"
                value={formData.dataScadenzaIscrizioni}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="luogo"
                label="Luogo"
                sx={{ mb: 2 }}
                value={formData.luogo}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="livello"
                label="Livello"
                value={formData.livello}
                onChange={handleChange}
                fullWidth
                required
                select
                SelectProps={{ native: true }}
              >
                {Object.entries(CompetitionLevel).map(([value, label]) => (
                  <option key={value} value={label}>{label}</option>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            name="indirizzo"
            label="Indirizzo"
            value={formData.indirizzo}
            onChange={handleChange}
            fullWidth
          />
          <Divider sx={{ my: 2 }} />
          <CompetitionCategoryManager
            value={{ 
              categorieAtleti: formData.categorieAtleti,
              tipiCompetizione: formData.tipiCompetizione 
            }}
            onChange={handleCategoriesChange}
            error={!formData.categorieAtleti || formData.categorieAtleti.length === 0}
            helperText={!formData.categorieAtleti || formData.categorieAtleti.length === 0 ? 'Configura almeno una categoria per gli atleti' : ''}
            isEditMode={isEditMode}
          />
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <EuroIcon color="primary" />
              <Typography variant="h6">
                Costi Iscrizione
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setCostModalOpen(true)}
            >
              {formData.costiIscrizione ? 'Modifica Costi' : 'Configura Costi'}
            </Button>
          </Box>
          {formData.costiIscrizione && (
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                Configurazione costi impostata ✓
              </Typography>
              {formData.costiIscrizione.specials && Object.keys(formData.costiIscrizione.specials).length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  • {Object.keys(formData.costiIscrizione.specials).length} costi speciali
                </Typography>
              )}
              {formData.costiIscrizione.categories && formData.costiIscrizione.categories.length > 0 && (
                <Typography variant="caption" color="text.secondary" display="block">
                  • {formData.costiIscrizione.categories.length} configurazioni per tipo atleta
                </Typography>
              )}
            </Box>
          )}
          {formData.iban && (
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                Configurazione Iban impostata ✓
              </Typography>
              {formData.iban && (
                <Typography variant="caption" color="text.secondary">
                  • {formData.iban} impostato per versare i pagamenti
                </Typography>
              )}                            
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <TextField
            name="descrizione"
            label="Descrizione"
            value={formData.descrizione}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h8">
            Modifica lo stato della competizione:
          </Typography>

          <TextField
            name="stato"
            value={formData.stato}
            onChange={handleChange}
            sx={{ mt: 1 }}
            fullWidth
            required
            select
            SelectProps={{ native: true }}
          >
            {Object.entries(CompetitionStatus).map(([value, label]) => (
              <option key={value} value={label}>{label}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annulla</Button>
          <Button type="submit" variant="contained">
            {isEditMode ? 'Salva Modifiche' : 'Crea'}
          </Button>
        </DialogActions>
      </form>

      <CostManagementModal
        open={costModalOpen}
        onClose={() => setCostModalOpen(false)}
        value={{
          ...formData.costiIscrizione,
          iban: formData.iban || (competition && competition.iban) || ''
        }}
        onChange={handleCostsChange}
      />
    </Dialog>
  );
};

export default CompetitionModal;
