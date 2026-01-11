import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchTextField = ({ 
  value, 
  onChange, 
  placeholder = 'Cerca...', 
  onClear,
  sx = {},
  ...props 
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{ padding: '4px' }}
            >
              <ClearIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </InputAdornment>
        ),
        sx: {
          backgroundColor: 'rgba(244, 244, 245, 1)',
          borderRadius: '8px',
          '& fieldset': {
            borderColor: 'transparent',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
            borderWidth: '2px',
          },
          '& input': {
            padding: '8.5px 14px',
          },
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '40px',
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default SearchTextField;
