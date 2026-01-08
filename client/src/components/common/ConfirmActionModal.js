import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import Button from './Button';

/**
 * Modale comune per confermare azioni
 * 
 * @param {Object} props - Proprietà del componente
 * @param {boolean} props.open - Se il modale è aperto
 * @param {function} props.onClose - Funzione chiamata quando si chiude il modale
 * @param {string} props.title - Titolo del modale
 * @param {string} props.subtitle - Sottotitolo opzionale
 * @param {string} props.message - Testo del messaggio
 * @param {Object} props.primaryButton - Configurazione del bottone primario { text: string, onClick: function, variant: string, icon: Component }
 * @param {Object} props.secondaryButton - Configurazione del bottone secondario { text: string, onClick: function, variant: string, icon: Component }
 * @param {boolean} props.loading - Se mostrare lo stato di caricamento
 */
const ConfirmActionModal = ({
  open,
  onClose,
  title,
  subtitle,
  message,
  primaryButton,
  secondaryButton,
  loading = false,
}) => {
  const handlePrimaryClick = () => {
    if (primaryButton?.onClick) {
      primaryButton.onClick();
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButton?.onClick) {
      secondaryButton.onClick();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      {title && (
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </DialogTitle>
      )}

      {message && (
        <DialogContent>
          <Typography variant="body1" color="text.primary">
            {message}
          </Typography>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
          {secondaryButton?.text && (
            <Button
              variant={secondaryButton.variant || 'primary'}
              size="m"
              icon={secondaryButton.icon}
              onClick={handleSecondaryClick}
              disabled={loading}
            >
              {secondaryButton.text}
            </Button>
          )}
          
          {primaryButton?.text && (
            <Button
              variant={primaryButton.variant || 'danger'}
              size="m"
              icon={primaryButton.icon}
              onClick={handlePrimaryClick}
              disabled={loading}
            >
              {primaryButton.text}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionModal;
