import axios from './axios';

// Funzione per ottenere tutti gli atleti
export const loadAllAthletes = async (filters) => {
  try {
    const response = await axios.get('/atleti/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento degli atleti:', error);
    throw error;
  }
};

// Funzione per creare un nuovo atleta
export const createAthlete = async (athleteData) => {
  try {
    const response = await axios.post('/atleti/', athleteData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione dell\'atleta:', error);
    throw error;
  }
};

// Funzione per aggiornare un atleta esistente
export const updateAthlete = async (athleteId, athleteData) => {
  try {
    const response = await axios.put(`/atleti/${athleteId}/`, athleteData);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'atleta:', error);
    throw error;
  }
};

// Funzione per eliminare un atleta
export const deleteAthlete = async (athleteId) => {
  try {
    await axios.delete(`/atleti/${athleteId}/`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'atleta:', error);
    throw error;
  }
};

