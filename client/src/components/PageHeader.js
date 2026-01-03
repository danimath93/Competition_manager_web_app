import React from 'react';
import './styles/PageHeader.css';

/**
 * Componente per l'intestazione delle pagine
 * 
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.icon - Icona da mostrare a sinistra (componente React Icon)
 * @param {string} props.title - Titolo della pagina
 * @param {string} props.subtitle - Sottotitolo/descrizione opzionale
 * @param {React.ReactNode} props.actions - Elementi aggiuntivi da mostrare a destra (es. pulsanti)
 * @param {string} props.className - Classe CSS aggiuntiva
 */
const PageHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  actions,
  className = '' 
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-main">
        <div className="page-header-content">
          {Icon && (
            <div className="page-header-icon">
              <Icon />
            </div>
          )}
          <div className="page-header-text">
            <h1 className="page-header-title">{title}</h1>
            {subtitle && (
              <p className="page-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="page-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
