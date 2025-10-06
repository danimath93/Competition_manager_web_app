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
export const createClub = async (ClubData) => {
  try {
    const response = await axios.post('/club/', ClubData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione dell\'club:', error);
    throw error;
  }
};

// Funzione per aggiornare un club esistente
export const updateClub = async (ClubId, ClubData) => {
  try {
    const response = await axios.put(`/club/${ClubId}/`, ClubData);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'club:', error);
    throw error;
  }
};

// Funzione per eliminare un club
export const deleteClub = async (ClubId) => {
  try {
    await axios.delete(`/club/${ClubId}/`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'club:', error);
    throw error;
  }
};


