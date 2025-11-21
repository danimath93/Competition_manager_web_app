import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ErrorPage.css';

const ErrorPage = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (resetError) {
      resetError();
    }
    navigate('/');
  };

  const handleGoBack = () => {
    if (resetError) {
      resetError();
    }
    navigate(-1);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title">Oops! Qualcosa è andato storto</h1>
        <p className="error-message">
          Si è verificato un errore imprevisto. Ci scusiamo per l'inconveniente.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="error-details">
            <summary>Dettagli errore (solo in sviluppo)</summary>
            <pre>{error.toString()}</pre>
            {error.stack && <pre>{error.stack}</pre>}
          </details>
        )}

        <div className="error-actions">
          <button onClick={handleGoHome} className="btn btn-primary">
            Torna alla Home
          </button>
          <button onClick={handleGoBack} className="btn btn-secondary">
            Torna Indietro
          </button>
          <button onClick={handleReload} className="btn btn-secondary">
            Ricarica Pagina
          </button>
        </div>

        <div className="error-help">
          <p>Se il problema persiste, contatta l'assistenza tecnica.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
