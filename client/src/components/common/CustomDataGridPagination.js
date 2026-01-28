import React from 'react';
import {
  gridPageCountSelector,
  gridPageSelector,
  gridPageSizeSelector,
  gridRowCountSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';
import { Box, Button, IconButton, TablePagination } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

/**
 * Componente personalizzato per la paginazione della DataGrid
 * Mostra la pagina corrente e una lista di pagine cliccabili (max 5 visibili) centrata nel footer
 */
const CustomDataGridPagination = (props) => {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const currentPage = useGridSelector(apiRef, gridPageSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowCount = useGridSelector(apiRef, gridRowCountSelector);

  const handlePageClick = (page) => {
    apiRef.current.setPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      apiRef.current.setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pageCount - 1) {
      apiRef.current.setPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (event) => {
    apiRef.current.setPageSize(parseInt(event.target.value, 10));
  };

  /**
   * Calcola quali numeri di pagina mostrare
   * Mostra max 5 pagine con ellipsis quando necessario
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (pageCount <= maxVisible) {
      // Mostra tutte le pagine se sono <= 5
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Logica per mostrare pagine con ellipsis
      if (currentPage < 3) {
        // Inizio: 1 2 3 4 ... 10
        pages.push(0, 1, 2, 3, '...', pageCount - 1);
      } else if (currentPage > pageCount - 4) {
        // Fine: 1 ... 7 8 9 10
        pages.push(0, '...', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1);
      } else {
        // Mezzo: 1 ... 4 5 6 ... 10
        pages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', pageCount - 1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: { xs: 'column', lg: 'row' },
        width: '100%',
        px: 2,
        py: { xs: 2, md: 2, lg: 0 },
        gap: { xs: 2, md: 2, lg: 0 },
        position: 'relative',
      }}
    >
      {/* Parte centrale: Selettore di pagina */}
      {pageCount > 1 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontFamily: "'Outfit', sans-serif",
            order: { xs: 2, md: 2, lg: 0 },
          }}
        >
          {/* Freccia sinistra */}
          <IconButton
            onClick={handlePrevious}
            disabled={currentPage === 0}
            size="small"
            sx={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Numeri di pagina */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <Box
                  key={`ellipsis-${index}`}
                  sx={{
                    px: 1,
                    color: 'text.secondary',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.875rem',
                  }}
                >
                  ...
                </Box>
              );
            }

            const isActive = page === currentPage;
            const displayPage = page + 1; // Mostra 1-based all'utente

            return (
              <Button
                key={page}
                onClick={() => handlePageClick(page)}
                variant={isActive ? 'contained' : 'outlined'}
                size="small"
                sx={{
                  minWidth: '36px',
                  height: '36px',
                  px: 1,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  border: isActive ? 'none' : '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {displayPage}
              </Button>
            );
          })}

          {/* Freccia destra */}
          <IconButton
            onClick={handleNext}
            disabled={currentPage === pageCount - 1}
            size="small"
            sx={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* Parte destra: Righe per pagina e contatore */}
      <Box 
        sx={{ 
          position: { xs: 'static', md: 'static', lg: 'absolute' },
          right: { lg: 16 },
          display: 'flex', 
          alignItems: 'center',
          order: { xs: 1, md: 1, lg: 0},
        }}
      >
        <TablePagination
          component="div"
          count={rowCount}
          page={currentPage}
          rowsPerPage={pageSize}
          onPageChange={() => {}} // Non utilizzato, usiamo i nostri handler
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={props.rowsPerPageOptions || [5, 10, 25, 50, 100]}
          labelRowsPerPage="Righe per pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} di ${count}`}
          sx={{
            border: 'none',
            '& .MuiToolbar-root': {
              minHeight: 'auto',
              padding: 0,
            },
            '& .MuiTablePagination-actions': {
              display: 'none', // Nascondi le frecce di default
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontFamily: "'Outfit', sans-serif",
              marginBottom: 0,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CustomDataGridPagination;


