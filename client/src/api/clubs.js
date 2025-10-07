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
// Funzione per creare un nuovo club
export const createClub = async (clubData) => {
  try {
    const response = await axios.post('/clubs/', clubData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione dell\'club:', error);
    throw error;
  }
};

// Funzione per aggiornare un club esistente
export const updateClub = async (clubId, clubData) => {
  try {
    const response = await axios.put(`/clubs/${clubId}/`, clubData);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'club:', error);
    throw error;
  }
};

// Funzione per eliminare un club
export const deleteClub = async (clubId) => {
  try {
    await axios.delete(`/clubs/${clubId}/`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'club:', error);
    throw error;
  }
};


