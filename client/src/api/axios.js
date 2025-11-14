import axios from 'axios';
import { clearAuthData } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3050/api';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

// Aggiungiamo il token a ogni richiesta
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        console.log("Token scaduto");
        clearAuthData();
        window.location.href = "/login";
        return;
      }
      else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp < currentTime; // True se il token è scaduto
  } catch (error) {
    console.error("Errore nella decodifica del token:", error);
    return true; // Consideriamo il token scaduto se c'è un errore
  }
};

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = {
      message: 'Errore di connessione al server',
      statusCode: 500,
      type: 'NETWORK_ERROR',
      details: null,
    };

    if (error.response) {
      const { status, data } = error.response;
      errorResponse.statusCode = status;

      // Gestione errori basata sullo status code
      switch (status) {
        case 400:
          // Errore di validazione - mostra messaggio dal server
          errorResponse.type = 'VALIDATION_ERROR';
          errorResponse.message = data?.error || data?.message || 'Dati non validi';
          errorResponse.details = data?.details || null;
          break;

        case 401:
          // Non autorizzato
          errorResponse.type = 'UNAUTHORIZED';
          errorResponse.message = data?.error || data?.message || 'Sessione scaduta. Effettua nuovamente il login.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect al login dopo un breve delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          break;

        case 403:
          // Accesso negato
          errorResponse.type = 'FORBIDDEN';
          errorResponse.message = data?.error || data?.message || 'Non hai i permessi per eseguire questa operazione.';
          break;

        case 404:
          // Risorsa non trovata
          errorResponse.type = 'NOT_FOUND';
          errorResponse.message = data?.error || data?.message || 'Risorsa non trovata.';
          break;

        case 409:
          // Conflitto (es. duplicato)
          errorResponse.type = 'CONFLICT';
          errorResponse.message = data?.error || data?.message || 'Elemento già esistente.';
          break;

        case 500:
          // Errore del server
          errorResponse.type = 'SERVER_ERROR';
          errorResponse.message = data?.error || data?.message || 'Errore interno del server.';
          break;
        case 502:
        case 503:
        case 504:
          // Errore del server
          errorResponse.type = 'SERVER_ERROR';
          errorResponse.message = data?.error || data?.message || 'Errore interno del server.';
          break;

        default:
          // Altri errori
          errorResponse.type = 'UNKNOWN_ERROR';
          errorResponse.message = data?.error || data?.message || 'Si è verificato un errore imprevisto.';
      }
    } else if (error.request) {
      // Richiesta inviata ma nessuna risposta
      errorResponse.type = 'NETWORK_ERROR';
      errorResponse.message = 'Impossibile contattare il server. Controlla la tua connessione.';
    }

    // Log solo in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorResponse, error);
    }

    return Promise.reject(errorResponse);
  }
);

export default instance;
