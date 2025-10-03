import axios from './axios';

export const loadAllClubs = async () => {
  try {
    const response = await axios.get('/clubs');
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento dei club:', error);
    throw error;
  }
};
