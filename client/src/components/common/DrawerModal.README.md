# DrawerModal - Componente Riutilizzabile

## Descrizione
DrawerModal è un componente modale riutilizzabile che appare dal lato destro dello schermo, ideale per moduli di modifica, dettagli e altre operazioni che richiedono un'interfaccia laterale.

## Caratteristiche
- ✅ Slide-in animation da destra
- ✅ Header con titolo e badge opzionale
- ✅ Contenuto scrollabile
- ✅ Footer fisso per azioni/pulsanti
- ✅ Completamente personalizzabile
- ✅ Stile consistente con il tema dell'app
- ✅ Responsive design

## Utilizzo Base

```jsx
import DrawerModal from './common/DrawerModal';
import './common/DrawerModal.css';

const MyComponent = () => {
  const [open, setOpen] = useState(false);

  return (
    <DrawerModal
      open={open}
      onClose={() => setOpen(false)}
      title="Titolo Modale"
      badge={5}
      footer={
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained">Salva</Button>
        </Box>
      }
    >
      <div className="drawer-section">
        <h3 className="drawer-section-title">Sezione 1</h3>
        <div className="drawer-section-content">
          {/* Contenuto qui */}
        </div>
      </div>
    </DrawerModal>
  );
};
```

## Props

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `open` | boolean | - | Controlla la visibilità del drawer (required) |
| `onClose` | function | - | Callback quando il drawer viene chiuso (required) |
| `title` | string | - | Titolo mostrato nell'header (required) |
| `badge` | number/string | undefined | Badge numerico accanto al titolo (opzionale) |
| `children` | ReactNode | - | Contenuto principale del drawer (required) |
| `footer` | ReactNode | undefined | Contenuto del footer (pulsanti, azioni, ecc.) |
| `width` | string | '600px' | Larghezza del drawer |

## Classi CSS Disponibili

### Struttura Base
- `drawer-modal-container`: Container principale
- `drawer-modal-header`: Header del drawer
- `drawer-modal-content`: Area contenuto scrollabile
- `drawer-modal-footer`: Footer fisso

### Sezioni di Contenuto
```jsx
<div className="drawer-section">
  <h3 className="drawer-section-title">Titolo Sezione</h3>
  <div className="drawer-section-content">
    {/* Contenuto */}
  </div>
</div>
```

### Layout a Griglia
```jsx
{/* Griglia responsive */}
<div className="drawer-fields-row">
  <TextField />
  <TextField />
</div>

{/* Griglia 2 colonne */}
<div className="drawer-fields-row-2">
  <TextField />
  <TextField />
</div>

{/* Griglia 3 colonne */}
<div className="drawer-fields-row-3">
  <TextField />
  <TextField />
  <TextField />
</div>
```

### Field Group
```jsx
<div className="drawer-field-group">
  <span className="drawer-field-label">Etichetta</span>
  <span className="drawer-field-value">Valore</span>
</div>
```

## Esempio Completo: Modale di Modifica

```jsx
import React, { useState } from 'react';
import { Button, TextField, Autocomplete } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import DrawerModal from './common/DrawerModal';
import './common/DrawerModal.css';

const EditModal = ({ open, onClose, item, onSave, onDelete }) => {
  const [formData, setFormData] = useState(item);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Modifica Elemento"
      badge={formData.id}
      width="700px"
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {/* Azioni a sinistra */}
          <Box>
            <Button
              onClick={() => onDelete(item.id)}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Elimina
            </Button>
          </Box>
          
          {/* Azioni a destra */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                bgcolor: 'var(--color-primary)',
                '&:hover': {
                  bgcolor: 'var(--color-primary-dark)',
                }
              }}
            >
              Salva Modifiche
            </Button>
          </Box>
        </Box>
      }
    >
      {/* Sezione 1 */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Informazioni Base</h3>
        <div className="drawer-section-content">
          <div className="drawer-fields-row-2">
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Cognome"
              value={formData.cognome}
              onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
              fullWidth
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Sezione 2 */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Dettagli</h3>
        <div className="drawer-section-content">
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            fullWidth
            size="small"
          />
        </div>
      </div>
    </DrawerModal>
  );
};

export default EditModal;
```

## Personalizzazione

### Modificare la Larghezza
```jsx
<DrawerModal
  width="800px"  // Drawer più largo
  // ... altre props
/>
```

### Footer Personalizzato con Layout Diverso
```jsx
<DrawerModal
  footer={
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2, 
      width: '100%' 
    }}>
      <Alert severity="warning">Attenzione: questa azione è irreversibile</Alert>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button>Annulla</Button>
        <Button variant="contained">Conferma</Button>
      </Box>
    </Box>
  }
>
  {/* ... contenuto */}
</DrawerModal>
```

## Best Practices

1. **Organizza il contenuto in sezioni** usando `drawer-section` per una migliore leggibilità
2. **Usa le griglie predefinite** (`drawer-fields-row-2`, `drawer-fields-row-3`) per layout consistenti
3. **Mantieni il footer semplice** con massimo 2-3 azioni principali
4. **Usa size="small"** per i TextField per un layout più compatto
5. **Sfrutta le variabili CSS** del tema per colori e spaziature consistenti

## Variabili CSS Utilizzate

Il componente utilizza le seguenti variabili CSS globali:
- `--spacing-*`: Per spaziature consistenti
- `--color-primary`: Per elementi principali
- `--text-*`: Per colori del testo
- `--bg-*`: Per sfondi
- `--border-*`: Per bordi
- `--radius-*`: Per border radius
- `--transition-*`: Per animazioni

## Responsive Design

Il drawer si adatta automaticamente a schermi più piccoli:
- Su mobile (< 768px): larghezza massima 90vw
- Le griglie multi-colonna diventano single-column
- Padding ridotto per ottimizzare lo spazio
