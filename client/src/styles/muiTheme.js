import { createTheme } from '@mui/material/styles';
import CustomDataGridPagination from '../components/common/CustomDataGridPagination';

/**
 * Tema Material-UI personalizzato che applica:
 * - Font family Outfit a tutti i componenti
 * - Colori dal tema dell'applicazione (variabili CSS)
 * - Stili consistenti con le variabili CSS globali
 */
const muiCustomTheme = createTheme({
  // Tipografia globale con responsive breakpoints - Utilizza variabili CSS dove possibile
  typography: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    
    // Font weights - Valori da var(--font-*)
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    // Varianti tipografiche con dimensioni responsive da variabili CSS
    h1: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-3xl)', // mobile: 1.875rem (30px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-4xl)', // desktop: 2.25rem (36px)
      },
      fontWeight: 700, // var(--font-bold)
      lineHeight: 1.3,
    },
    h2: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-2xl)', // mobile: 1.5rem (24px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-3xl)', // desktop: 1.875rem (30px)
      },
      fontWeight: 700, // var(--font-bold)
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-xl)', // mobile: 1.25rem (20px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-2xl)', // desktop: 1.5rem (24px)
      },
      fontWeight: 600, // var(--font-semibold)
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-lg)', // mobile: 1.125rem (18px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-xl)', // desktop: 1.25rem (20px)
      },
      fontWeight: 600, // var(--font-semibold)
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-base)', // mobile: 1rem (16px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-lg)', // desktop: 1.125rem (18px)
      },
      fontWeight: 500, // var(--font-medium)
      lineHeight: 1.3,
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-sm)', // mobile: 0.875rem (14px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-base)', // desktop: 1rem (16px)
      },
      fontWeight: 500, // var(--font-medium)
      lineHeight: 1.3,
    },
    body1: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-sm)', // mobile: 0.875rem (14px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-base)', // desktop: 1rem (16px)
      },
      fontWeight: 400, // var(--font-normal)
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-xs)', // mobile: 0.75rem (12px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-sm)', // desktop: 0.875rem (14px)
      },
      fontWeight: 400, // var(--font-normal)
      lineHeight: 1.6,
    },
    button: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'var(--font-sm)', // mobile: 0.875rem (14px)
      '@media (min-width:600px)': {
        fontSize: 'var(--font-base)', // desktop: 1rem (16px)
      },
      fontWeight: 600, // var(--font-semibold)
      textTransform: 'none', // Disabilita UPPERCASE di default
    },
  },

  // Palette colori - Valori da variables.css
  palette: {
    primary: {
      main: 'rgba(35, 35, 35, 1)', // var(--color-secondary)
      dark: '#1a1a1a', // var(--text-dark)
      light: '#333333', // var(--text-primary)
      contrastText: '#ffffff', // var(--text-white)
    },
    secondary: {
      main: 'rgba(166, 11, 0, 1)', // var(--color-primary)
      dark: 'rgba(139, 9, 0, 1)', // var(--color-primary-dark)
      light: 'rgba(220, 53, 69, 0.1)', // var(--color-primary-light)
      contrastText: '#ffffff', // var(--text-white)
    },
    error: {
      main: '#dc3545', // var(--color-error)
      contrastText: '#ffffff', // var(--text-white)
    },
    warning: {
      main: '#ffc107', // var(--color-warning)
      contrastText: '#1a1a1a', // var(--text-dark)
    },
    info: {
      main: 'rgba(37, 99, 235, 1)', // var(--color-info-button)
      dark: 'rgba(30, 64, 175, 1)', // var(--color-info-hover)
      light: 'rgba(37, 99, 235, 1)', // var(--color-info-focus)
      contrastText: '#ffffff', // var(--text-white)
    },
    success: {
      main: '#28a745', // var(--color-success)
      contrastText: '#ffffff', // var(--text-white)
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

  // Shape - Utilizza variabili CSS
  shape: {
    borderRadius: 8, // var(--radius-md) - Non può usare var() direttamente qui (numero richiesto)
  },

  // Shadows personalizzate - Utilizza variabili CSS
  shadows: [
    'none',
    'var(--shadow-sm)',
    'var(--shadow-md)',
    'var(--shadow-lg)',
    'var(--shadow-primary)',
    ...Array(20).fill('var(--shadow-md)'),
  ],

  // Componenti specifici
  components: {
    // Button - Applica font Outfit e stili consistenti con variabili CSS
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          transition: 'var(--transition-normal)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow-md)',
          },
        },
        sizeLarge: {
          padding: 'var(--spacing-md) var(--spacing-xl)',
          fontSize: 'var(--font-lg)',
        },
        sizeMedium: {
          padding: 'var(--spacing-sm) var(--spacing-md)',
          fontSize: 'var(--font-sm)',
        },
        sizeSmall: {
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          fontSize: 'var(--font-xs)',
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

    // DataGrid - Configurazione globale per tutte le griglie
    MuiDataGrid: {
      defaultProps: {
        // Configurazione paginazione di default
        initialState: {
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        },
        // Opzioni per il selettore "Righe per pagina"
        pageSizeOptions: [5, 10, 25, 50, 100],
        // Slot personalizzato per la paginazione con selettore di pagina
        slots: {
          pagination: CustomDataGridPagination,
        },
        // Configurazione paginazione con pulsanti prima/ultima pagina
        slotProps: {
          pagination: {
            showFirstButton: true,
            showLastButton: true,
          },
        },
        // Opzioni comuni
        disableRowSelectionOnClick: true,
        disableColumnSelector: true,
      },
      styleOverrides: {
        root: {
          fontFamily: "'Outfit', sans-serif",
          border: 'none',
          minHeight: '400px',
          '& .MuiDataGrid-cell': {
            fontFamily: "'Outfit', sans-serif",
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--bg-secondary, #f8f9fa)',
          },
          '& .MuiDataGrid-columnHeaders': {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            backgroundColor: 'var(--bg-secondary, #f8f9fa)',
          },
          // Stili per la paginazione
          '& .MuiTablePagination-root': {
            fontFamily: "'Outfit', sans-serif",
          },
          '& .MuiTablePagination-select': {
            fontFamily: "'Outfit', sans-serif",
          },
          '& .MuiTablePagination-selectLabel': {
            fontFamily: "'Outfit', sans-serif",
          },
          '& .MuiTablePagination-displayedRows': {
            fontFamily: "'Outfit', sans-serif",
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
