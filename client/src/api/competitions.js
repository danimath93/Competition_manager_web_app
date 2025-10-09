import axios from './axios';

// Carica tutte le competizioni (per admin)
export const loadAllCompetitions = async () => {
  try {
    const response = await axios.get('/competizioni');
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento delle competizioni:', error);
    throw error;
  }
};

// Carica le competizioni per l'utente standard (attive e iscritte)
export const loadUserCompetitions = async () => {
    try {
      // Questa rotta dovrà essere implementata nel backend
      const response = await axios.get('/competizioni/user'); 
      return response.data;
    } catch (error) {
      console.error('Errore nel caricamento delle competizioni per l\'utente:', error);
      throw error;
    }
  };

// Ottiene i dettagli di una competizione specifica (per admin)
export const getCompetitionDetails = async (id) => {
    try {
        const response = await axios.get(`/competizioni/${id}/details`);
        return response.data;
    } catch (error) {
        console.error('Errore nel caricamento dei dettagli della competizione:', error);
        throw error;
    }
};

// Crea una nuova competizione
export const createCompetition = async (competitionData) => {
  try {
    const response = await axios.post('/competizioni', competitionData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione della competizione:', error);
    throw error;
  }
};

// Aggiorna una competizione esistente
export const updateCompetition = async (id, competitionData) => {
  try {
    const response = await axios.put(`/competizioni/${id}`, competitionData);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della competizione:', error);
    throw error;
  }
};

// Elimina una competizione
export const deleteCompetition = async (id) => {
  try {
    await axios.delete(`/competizioni/${id}`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione della competizione:', error);
    throw error;
  }
};
