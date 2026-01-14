import { createTheme } from '@mui/material/styles';

/**
 * Tema Material-UI personalizzato che applica:
 * - Font family Outfit a tutti i componenti
 * - Colori dal tema dell'applicazione (variabili CSS)
 * - Stili consistenti con le variabili CSS globali
 */
const muiCustomTheme = createTheme({
  // Tipografia globale
  typography: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    
    // Font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    // Varianti tipografiche
    h1: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h2: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    body1: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
      textTransform: 'none', // Disabilita UPPERCASE di default
    },
  },

  // Palette colori (corrispondono alle variabili CSS)
  palette: {
    primary: {
      main: '#232323', // var(--color-secondary)
      dark: '#1a1a1a',
      light: '#333333',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a60b00', // var(--color-primary)
      dark: '#8b0900', // var(--color-primary-dark)
      light: '#dc3545', // var(--color-primary-light)
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc3545', // var(--color-error)
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffc107', // var(--color-warning)
      contrastText: '#1a1a1a',
    },
    info: {
      main: 'rgba(0, 86, 156, 1)', // var(--color-info-button)
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    success: {
      main: '#28a745', // var(--color-success)
      contrastText: '#ffffff',
    },
    text: {
      primary: '#333333', // var(--text-primary)
      secondary: '#666666', // var(--text-secondary)
      disabled: '#999999', // var(--text-tertiary)
    },
    background: {
      default: '#f8f9fa', // var(--bg-secondary)
      paper: '#ffffff', // var(--bg-primary)
    },
  },

  // Shape (border radius)
  shape: {
    borderRadius: 8, // var(--radius-md)
  },

  // Shadows personalizzate
  shadows: [
    'none',
    '0 2px 4px rgba(0, 0, 0, 0.1)', // --shadow-sm
    '0 4px 8px rgba(0, 0, 0, 0.2)', // --shadow-md
    '0 4px 12px rgba(0, 0, 0, 0.3)', // --shadow-lg
    '0 4px 12px rgba(220, 53, 69, 0.3)', // --shadow-primary
    ...Array(20).fill('0 4px 8px rgba(0, 0, 0, 0.2)'),
  ],

  // Componenti specifici
  components: {
    // Button - Applica font Outfit e stili consistenti
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        sizeLarge: {
          padding: '1rem 2rem',
          fontSize: '1.125rem',
        },
        sizeMedium: {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
        },
        sizeSmall: {
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
        },
      },
    },

    // TextField
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontFamily: "'Outfit', sans-serif",
          },
          '& .MuiInputLabel-root': {
            fontFamily: "'Outfit', sans-serif",
          },
        },
      },
    },

    // Autocomplete
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontFamily: "'Outfit', sans-serif",
          },
        },
        option: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Typography
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // DataGrid
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
          border: 'none',
          '& .MuiDataGrid-cell': {
            fontFamily: "'Outfit', sans-serif",
          },
          '& .MuiDataGrid-columnHeaders': {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
        },
      },
    },

    // Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Menu/MenuItem
    MuiMenu: {
      styleOverrides: {
        paper: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // Select
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },

    // FormControl
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontFamily: "'Outfit', sans-serif",
          },
        },
      },
    },

    // Tabs
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
          textTransform: 'none',
        },
      },
    },

    // Table
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },
  },
});

export default muiCustomTheme;
