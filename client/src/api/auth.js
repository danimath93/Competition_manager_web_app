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

const sendConfirmationEmail = async (to, token) => {
  try {
    const response = await axios.post('/auth/sendConfirmationEmail/', { to, token });
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di conferma:', error);
    throw error;
  }
};

export { loginUser, logoutUser, registerUser, sendConfirmationEmail };