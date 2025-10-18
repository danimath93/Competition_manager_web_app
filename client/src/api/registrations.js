import axios from './axios';

// Funzione per ottenere tutte le iscrizioni di una competizione
export const loadRegistrationsByCompetition = async (competitionId) => {
  try {
    const response = await axios.get(`/iscrizioni/competizione/${competitionId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle iscrizioni della competizione:', error);
    throw error;
  }
};

// Funzione per ottenere le iscrizioni di un club per una competizione specifica
export const loadRegistrationsByCompetitionAndClub = async (competitionId, clubId) => {
  try {
    const response = await axios.get(`/iscrizioni/competizione/${competitionId}/club/${clubId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle iscrizioni del club:', error);
    throw error;
  }
};

// Funzione per confermare l'iscrizione di un club per una competizione
export const confirmClubRegistration = async (competitionId, clubId) => {
  try {
    const response = await axios.post('/iscrizioni/conferma', { competitionId, clubId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la conferma dell\'iscrizione del club:', error);
    throw error;
  }
};

// Funzione per modificare l'iscrizione di un club per una competizione
export const editClubRegistration = async (competitionId, clubId) => {
  try {
    const response = await axios.post('/iscrizioni/modifica', { competitionId, clubId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la modifica dell\'iscrizione del club:', error);
    throw error;
  }
};

// Funzione per creare una nuova iscrizione
export const createRegistration = async (registrationData) => {
  try {
    const response = await axios.post('/iscrizioni/', registrationData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione dell\'iscrizione:', error);
    throw error;
  }
};

// Funzione per eliminare un'iscrizione specifica
export const deleteRegistration = async (registrationId) => {
  try {
    await axios.delete(`/iscrizioni/${registrationId}`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'iscrizione:', error);
    throw error;
  }
};

// Funzione per eliminare tutte le iscrizioni di un atleta per una competizione
export const deleteAthleteRegistrations = async (athleteId, competitionId) => {
  try {
    const response = await axios.delete(`/iscrizioni/atleta/${athleteId}/competizione/${competitionId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'eliminazione delle iscrizioni dell\'atleta:', error);
    throw error;
  }
};