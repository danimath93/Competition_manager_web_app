import axios from './axios';

// Funzione per effettuare il login
const loginUser = async (username, password) => {
  try {
    const response = await axios.post('/auth/login/', { username, password });
    return response.data;
  } catch (error) {
    console.error('Errore durante il login:', error);
    throw error;
  }
};

// Funzione per effettuare il logout
const logoutUser = async () => {
  try {
    const response = await axios.post('/auth/logout/');
    return response.data;
  } catch (error) {
    console.error('Errore durante il logout:', error);
    throw error;
  }
};

// Funzione per registrare un nuovo utente
const registerUser = async (userData) => {
  try {
    const response = await axios.post('/auth/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    throw error;
  }
};

// Funzione per richiedere il reset password
const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post('/auth/request-password-reset/', { email });
    return response.data;
  } catch (error) {
    console.error('Errore richiesta reset password:', error);
    throw error;
  }
};

// Funzione per confermare il reset password
const resetPassword = async (token, password) => {
  try {
    const response = await axios.post('/auth/reset-password/', { token, password });
    return response.data;
  } catch (error) {
    console.error('Errore reset password:', error);
    throw error;
  }
};

const sendConfirmationEmail = async (to, token) => {
  try {
    const response = await axios.post('/auth/sendConfirmationEmail/', { to, token });
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di conferma:', error);
    throw error;
  }
};

const confirmUser = async (token) => {
  try {
    const response = await axios.get(`/auth/confirm?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante la conferma dell\'utente:', error);
    throw error;
  }
};

export { loginUser, logoutUser, registerUser, sendConfirmationEmail, confirmUser, requestPasswordReset, resetPassword };