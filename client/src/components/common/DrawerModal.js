import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider } from '@mui/material';
import { Close } from '@mui/icons-material';
import './DrawerModal.css';

/**
 * Componente Drawer modale riutilizzabile che appare da destra
 * 
 * @param {boolean} open - Controlla se il drawer è aperto
 * @param {function} onClose - Funzione chiamata alla chiusura
 * @param {string} title - Titolo del drawer
 * @param {number} badge - Numero badge da mostrare accanto al titolo (opzionale)
 * @param {ReactNode} children - Contenuto principale del drawer
 * @param {ReactNode} footer - Contenuto del footer (pulsanti, azioni, ecc.)
 * @param {string} width - Larghezza del drawer (default: '600px')
 */
const DrawerModal = ({ 
  open, 
  onClose, 
  title, 
  badge,
  children, 
  footer,
  width = '800px' 
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      className="drawer-modal"
      PaperProps={{
        sx: {
          width: width,
          maxWidth: '90vw',
        }
      }}
    >
      <Box className="drawer-modal-container">
        {/* Header */}
        <Box className="drawer-modal-header">
          <Box className="drawer-modal-title-container">
            <Typography variant="h5" className="drawer-modal-title">
              {title}
            </Typography>
            {badge !== undefined && badge !== null && (
              <Box className="drawer-modal-badge">
                {badge}
              </Box>
            )}
          </Box>
          <IconButton 
            onClick={onClose}
            className="drawer-modal-close-btn"
            size="small"
          >
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box className="drawer-modal-content">
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <>
            <Divider />
            <Box className="drawer-modal-footer">
              {footer}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default DrawerModal;
