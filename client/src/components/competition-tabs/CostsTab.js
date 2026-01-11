import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { Edit as EditIcon, Euro as EuroIcon } from '@mui/icons-material';
import CostManagementModal from '../CostManagementModal';

const CostsTab = ({ value, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCostsChange = (costiIscrizione, iban, intestatario, causale) => {
    onChange(costiIscrizione, iban, intestatario, causale);
    setModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <EuroIcon color="primary" />
          <Typography variant="h6">Configurazione Costi Iscrizione</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setModalOpen(true)}
        >
          {value.costiIscrizione ? 'Modifica Costi' : 'Configura Costi'}
        </Button>
      </Box>

      {value.costiIscrizione ? (
        <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 1, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            ✓ Configurazione costi impostata
          </Typography>
          {value.costiIscrizione.specials &&
            Object.keys(value.costiIscrizione.specials).length > 0 && (
              <Typography variant="body2" color="text.secondary">
                • {Object.keys(value.costiIscrizione.specials).length} costi speciali
              </Typography>
            )}
          {value.costiIscrizione.categories &&
            value.costiIscrizione.categories.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                • {value.costiIscrizione.categories.length} configurazioni per tipo atleta
              </Typography>
            )}
        </Box>
      ) : (
        <Alert severity="info">
          Nessuna configurazione costi impostata. Clicca su "Configura Costi" per iniziare.
        </Alert>
      )}

      {value.iban && (
        <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 1 }}>
          <Typography variant="body1" gutterBottom>
            ✓ Configurazione IBAN impostata
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • IBAN: {value.iban}
          </Typography>
          {value.intestatario && (
            <Typography variant="body2" color="text.secondary">
              • Intestatario: {value.intestatario}
            </Typography>
          )}
          {value.causale && (
            <Typography variant="body2" color="text.secondary">
              • Causale: {value.causale}
            </Typography>
          )}
        </Box>
      )}

      <CostManagementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={value}
        onChange={handleCostsChange}
      />
    </Box>
  );
};

export default CostsTab;
