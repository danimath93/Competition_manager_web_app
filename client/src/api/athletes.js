import axios from './axios';

// Funzione per ottenere tutti gli atleti
export const loadAllAthletes = async (filters) => {
  try {
    const response = await axios.get('/athletes/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento degli atleti:', error);
    throw error;
  }
};
