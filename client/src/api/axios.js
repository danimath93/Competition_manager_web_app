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

export default instance;
