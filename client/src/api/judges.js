import axios from './axios';

// Funzione per ottenere tutti gli giudici
export const loadAllJudges = async () => {
  try {
    const response = await axios.get('/giudici');
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento dei giudici:', error);
    throw error;
  }
};

// Funzione per creare un nuovo giudice
export const createJudge = async (judgeData) => {
  try {
    const response = await axios.post('/giudici/', judgeData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione del giudice:', error);
    throw error;
  }
};

// Funzione per aggiornare un giudice esistente
export const updateJudge = async (judgeId, judgeData) => {
  try {
    const response = await axios.put(`/giudici/${judgeId}/`, judgeData);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del giudice:', error);
    throw error;
  }
};

// Funzione per eliminare un giudice
export const deleteJudge = async (judgeId) => {
  try {
    await axios.delete(`/giudici/${judgeId}/`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione del giudice:', error);
    throw error;
  }
};