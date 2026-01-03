/* 
 * ========================================
 * ESEMPIO DI UTILIZZO - COMMON PAGE STYLES
 * ========================================
 * 
 * Questo file mostra come utilizzare gli stili comuni
 * e il componente PageHeader nelle pagine.
 */

import React from 'react';
import PageHeader from '../components/PageHeader';
import { FaTachometerAlt, FaPlus } from 'react-icons/fa';
import '../pages/styles/CommonPageStyles.css';

const ExamplePage = () => {
  return (
    <div className="page-container">
      {/* Header della pagina con icona, titolo e sottotitolo */}
      <PageHeader
        icon={FaTachometerAlt}
        title="Titolo della Pagina"
        subtitle="Questa è una descrizione opzionale della pagina che spiega cosa l'utente può fare qui."
        actions={
          <>
            {/* Esempio di azioni/pulsanti nell'header */}
            <button className="btn btn-primary">
              <FaPlus /> Nuovo
            </button>
          </>
        }
      />

      {/* Contenuto della pagina */}
      <div className="page-content">
        
        {/* ESEMPIO 1: Card semplice */}
        <div className="page-card">
          <div className="page-card-header">
            <h2 className="page-card-title">Titolo Card</h2>
          </div>
          <div className="page-card-body">
            <p>Contenuto della card...</p>
          </div>
        </div>

        {/* ESEMPIO 2: Sezione con titolo */}
        <div className="page-section">
          <h2 className="page-section-title">Sezione Principale</h2>
          <p className="page-section-subtitle">
            Sottotitolo della sezione
          </p>
          <div className="page-card">
            <p>Contenuto della sezione...</p>
          </div>
        </div>

        {/* ESEMPIO 3: Grid di card */}
        <div className="page-grid">
          <div className="page-card">Card 1</div>
          <div className="page-card">Card 2</div>
          <div className="page-card">Card 3</div>
        </div>

        {/* ESEMPIO 4: Empty State */}
        <div className="page-empty-state">
          <div className="page-empty-state-icon">📭</div>
          <h3 className="page-empty-state-title">Nessun dato disponibile</h3>
          <p className="page-empty-state-text">
            Non ci sono ancora elementi da visualizzare.
          </p>
          <button className="btn btn-primary">Aggiungi Nuovo</button>
        </div>

      </div>
    </div>
  );
};

export default ExamplePage;


/* 
 * ========================================
 * CLASSI DISPONIBILI
 * ========================================
 * 
 * CONTAINER:
 * - page-container       : Container principale della pagina
 * - page-content         : Contenuto con padding appropriato
 * 
 * CARD:
 * - page-card            : Card generica
 * - page-card-header     : Header della card
 * - page-card-title      : Titolo della card
 * - page-card-body       : Corpo della card
 * 
 * SEZIONI:
 * - page-section         : Sezione della pagina
 * - page-section-title   : Titolo della sezione
 * - page-section-subtitle: Sottotitolo della sezione
 * 
 * GRID:
 * - page-grid            : Grid responsive auto
 * - page-grid-2          : Grid a 2 colonne
 * - page-grid-3          : Grid a 3 colonne
 * - page-grid-4          : Grid a 4 colonne
 * 
 * UTILITY:
 * - page-spacing-sm/md/lg/xl  : Margini bottom
 * - page-flex-center          : Flex centrato
 * - page-flex-between         : Flex space-between
 * - page-flex-start/end       : Flex start/end
 * - page-text-center          : Testo centrato
 * - page-text-muted           : Testo secondario
 * - page-text-light           : Testo terziario
 * - page-divider              : Linea di separazione
 * 
 * STATI:
 * - page-empty-state     : Stato vuoto
 * - page-loading         : Stato caricamento
 * - page-error           : Stato errore
 */
