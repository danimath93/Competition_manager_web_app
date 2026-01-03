# Common Page Styles - Guida all'Utilizzo

Questo sistema fornisce stili comuni e componenti riutilizzabili per tutte le pagine dell'applicazione.

## 📦 Componenti Disponibili

### 1. PageHeader
Componente per l'intestazione delle pagine con icona, titolo, sottotitolo e azioni.

**Importazione:**
```javascript
import PageHeader from '../components/PageHeader';
import { FaTachometerAlt } from 'react-icons/fa';
```

**Utilizzo Base:**
```jsx
<PageHeader
  icon={FaTachometerAlt}
  title="Titolo Pagina"
  subtitle="Descrizione opzionale della pagina"
/>
```

**Con Azioni:**
```jsx
<PageHeader
  icon={FaTachometerAlt}
  title="Titolo Pagina"
  subtitle="Descrizione"
  actions={
    <>
      <button className="btn btn-primary">Nuovo</button>
      <button className="btn btn-secondary">Esporta</button>
    </>
  }
/>
```

**Props:**
- `icon` (Component): Componente icona da React Icons
- `title` (string): Titolo principale
- `subtitle` (string, opzionale): Sottotitolo/descrizione
- `actions` (ReactNode, opzionale): Elementi da mostrare a destra
- `className` (string, opzionale): Classi CSS aggiuntive

---

## 🎨 Stili Comuni (CommonPageStyles.css)

### Struttura Base della Pagina

```jsx
import './styles/CommonPageStyles.css';

const MyPage = () => {
  return (
    <div className="page-container">
      <PageHeader
        icon={MyIcon}
        title="Titolo"
        subtitle="Sottotitolo"
      />
      
      <div className="page-content">
        {/* Contenuto qui */}
      </div>
    </div>
  );
};
```

---

## 📋 Classi CSS Disponibili

### Container
- **`page-container`**: Container principale della pagina
- **`page-content`**: Contenuto con padding appropriato

### Card
- **`page-card`**: Card generica con bordo e ombra
- **`page-card-header`**: Header della card
- **`page-card-title`**: Titolo della card
- **`page-card-body`**: Corpo della card

**Esempio:**
```jsx
<div className="page-card">
  <div className="page-card-header">
    <h2 className="page-card-title">Titolo Card</h2>
  </div>
  <div className="page-card-body">
    <p>Contenuto...</p>
  </div>
</div>
```

### Sezioni
- **`page-section`**: Sezione della pagina con margine
- **`page-section-title`**: Titolo della sezione
- **`page-section-subtitle`**: Sottotitolo della sezione

**Esempio:**
```jsx
<div className="page-section">
  <h2 className="page-section-title">Titolo Sezione</h2>
  <p className="page-section-subtitle">Descrizione</p>
  {/* Contenuto */}
</div>
```

### Grid Layouts
- **`page-grid`**: Grid responsive automatica (min 300px per colonna)
- **`page-grid-2`**: Grid a 2 colonne
- **`page-grid-3`**: Grid a 3 colonne
- **`page-grid-4`**: Grid a 4 colonne

**Esempio:**
```jsx
<div className="page-grid-3">
  <div className="page-card">Item 1</div>
  <div className="page-card">Item 2</div>
  <div className="page-card">Item 3</div>
</div>
```

**Nota:** Su mobile, tutte le grid diventano 1 colonna automaticamente.

### Spaziature
- **`page-spacing-sm`**: Margine bottom 1rem
- **`page-spacing-md`**: Margine bottom 1.5rem
- **`page-spacing-lg`**: Margine bottom 2rem
- **`page-spacing-xl`**: Margine bottom 3rem

### Flex Utilities
- **`page-flex-center`**: Centra contenuto
- **`page-flex-between`**: Space between
- **`page-flex-start`**: Allinea a sinistra con gap
- **`page-flex-end`**: Allinea a destra con gap

### Text Utilities
- **`page-text-center`**: Testo centrato
- **`page-text-muted`**: Testo secondario (grigio)
- **`page-text-light`**: Testo terziario (grigio chiaro)

### Altri
- **`page-divider`**: Linea di separazione orizzontale

---

## 🎭 Stati Speciali

### Empty State (Nessun Dato)
```jsx
<div className="page-empty-state">
  <div className="page-empty-state-icon">📭</div>
  <h3 className="page-empty-state-title">Nessun dato disponibile</h3>
  <p className="page-empty-state-text">
    Non ci sono ancora elementi da visualizzare.
  </p>
  <button className="btn btn-primary">Aggiungi Nuovo</button>
</div>
```

### Loading State
```jsx
<div className="page-loading">
  <p>Caricamento in corso...</p>
</div>
```

### Error State
```jsx
<div className="page-error">
  <p>Si è verificato un errore durante il caricamento dei dati.</p>
</div>
```

---

## 📱 Comportamento Responsive

### Desktop (> 1024px)
- Sidebar aperta: 255px
- Layout completo con tutte le funzionalità
- Grid multiple colonne

### Tablet (769px - 1024px)
- Sidebar chiusa: 105px
- Grid-3 e Grid-4 diventano 2 colonne
- Padding ridotto

### Mobile (≤ 768px)
- Sidebar chiusa: 105px
- Tutte le grid diventano 1 colonna
- Header actions vanno sotto
- Padding ulteriormente ridotto

### Mobile Piccolo (≤ 480px)
- Dimensioni e spaziature minime
- Icone e testi più piccoli

---

## ✨ Esempio Completo

```jsx
import React from 'react';
import PageHeader from '../components/PageHeader';
import { FaTrophy, FaPlus } from 'react-icons/fa';
import './styles/CommonPageStyles.css';

const Competitions = () => {
  return (
    <div className="page-container">
      <PageHeader
        icon={FaTrophy}
        title="Competizioni"
        subtitle="Gestisci e visualizza tutte le competizioni"
        actions={
          <button className="btn btn-primary">
            <FaPlus /> Nuova Competizione
          </button>
        }
      />

      <div className="page-content">
        {/* Sezione principale */}
        <div className="page-section">
          <h2 className="page-section-title">Competizioni Attive</h2>
          
          <div className="page-grid">
            <div className="page-card">
              <div className="page-card-header">
                <h3 className="page-card-title">Gara 1</h3>
              </div>
              <div className="page-card-body">
                <p>Dettagli competizione...</p>
              </div>
            </div>
            {/* Altre card... */}
          </div>
        </div>

        <div className="page-divider"></div>

        {/* Statistiche */}
        <div className="page-section">
          <h2 className="page-section-title">Statistiche</h2>
          <div className="page-grid-3">
            <div className="page-card">Stat 1</div>
            <div className="page-card">Stat 2</div>
            <div className="page-card">Stat 3</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Competitions;
```

---

## 🎯 Best Practices

1. **Usa sempre `page-container` come wrapper principale**
2. **Includi sempre `PageHeader` all'inizio**
3. **Wrappa il contenuto in `page-content`**
4. **Usa le classi grid per layout responsive automatici**
5. **Preferisci `page-card` per contenuti con bordi**
6. **Usa `page-section` per raggruppare contenuti correlati**
7. **Importa `CommonPageStyles.css` in ogni pagina**

---

## 🔧 Variabili CSS Utilizzate

Gli stili utilizzano le variabili globali definite in `variables.css`:
- `--color-primary`: Colore primario (rosso)
- `--text-primary`: Testo principale
- `--text-secondary`: Testo secondario
- `--bg-primary`: Background principale
- `--border-light`: Bordi chiari
- `--shadow-sm/md`: Ombre
- `--radius-sm/md/lg`: Border radius

---

## 📝 Note

- Il layout si adatta automaticamente alla sidebar (aperta/chiusa)
- Su mobile la sidebar è sempre chiusa a 105px
- Tutti gli stili sono responsive by default
- Le icone nel PageHeader devono provenire da `react-icons`
