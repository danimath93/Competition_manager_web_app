import React from 'react';
import ErrorPage from '../pages/ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo stato per mostrare la UI di fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log dell'errore per debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Salva i dettagli dell'errore nello stato
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Opzionale: invia l'errore a un servizio di logging
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // Renderizza la pagina di errore personalizzata
      return <ErrorPage error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
