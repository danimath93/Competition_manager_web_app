import React from 'react';
import { Box, Alert } from '@mui/material';
import CompetitionCategoryManager from '../CompetitionCategoryManager';

const CategoriesTab = ({ value, onChange, isEditMode }) => {
  const hasError = !value.categorieAtleti || value.categorieAtleti.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      {hasError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Configura almeno una categoria per gli atleti
        </Alert>
      )}
      <CompetitionCategoryManager
        value={value}
        onChange={onChange}
        error={hasError}
        isEditMode={isEditMode}
      />
    </Box>
  );
};

export default CategoriesTab;
