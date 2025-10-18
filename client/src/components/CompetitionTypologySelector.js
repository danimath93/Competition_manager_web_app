import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Box,
  Chip,
  Checkbox,
  TextField,
  FormHelperText
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { loadCompetitionTypes } from '../api/config';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const CompetitionTypologySelector = ({ value = [], onChange, error, helperText, disabled = false }) => {
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Carica i tipi di competizione disponibili
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const types = await loadCompetitionTypes();
        setAvailableTypes(types);
      } catch (err) {
        console.error('Errore nel caricamento dei tipi di competizione:', err);
        setAvailableTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  // Sincronizza i tipi selezionati con il valore dall'esterno
  useEffect(() => {
    if (value && Array.isArray(value) && availableTypes.length > 0) {
      const selected = availableTypes.filter(type => value.includes(type.id));
      setSelectedTypes(selected);
    } else {
      setSelectedTypes([]);
    }
  }, [value, availableTypes]);

  // Gestisce il cambiamento della selezione
  const handleChange = (event, newValue) => {
    setSelectedTypes(newValue);
    const selectedIds = newValue.map(type => type.id);
    onChange(selectedIds);
  };

  return (
    <FormControl fullWidth error={error}>
      <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', color: error ? 'error.main' : 'text.primary' }}>
        Tipologie Competizione *
      </FormLabel>
      
      <Autocomplete
        multiple
        disabled={disabled || loading}
        options={availableTypes}
        disableCloseOnSelect
        getOptionLabel={(option) => option.nome}
        value={selectedTypes}
        onChange={handleChange}
        loading={loading}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.nome}
            {option.descrizione && (
              <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                - {option.descrizione}
              </Box>
            )}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedTypes.length === 0 ? "Seleziona una o più tipologie" : ""}
            error={error}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option.id}
              label={option.nome}
              {...getTagProps({ index })}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))
        }
      />
      
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
      
      {!loading && availableTypes.length === 0 && (
        <FormHelperText error>
          Nessuna tipologia disponibile
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default CompetitionTypologySelector;