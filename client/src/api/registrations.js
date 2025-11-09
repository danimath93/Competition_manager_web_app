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
export const loadAthleteRegistrationsByCompetitionAndClub = async (competitionId, clubId) => {
  try {
    const response = await axios.get(`/iscrizioni/competizione/${competitionId}/club/${clubId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle iscrizioni del club:', error);
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

// ============ ISCRIZIONI CLUB ============

// Funzione per creare o recuperare l'iscrizione di un club a una competizione
export const createOrGetClubRegistration = async (clubId, competizioneId) => {
  try {
    const response = await axios.post('/iscrizioni/club-iscrizione', { clubId, competizioneId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la gestione dell\'iscrizione del club:', error);
    throw error;
  }
};

// Funzione per ottenere l'iscrizione di un club a una competizione
export const getClubRegistration = async (clubId, competizioneId) => {
  try {
    const response = await axios.get(`/iscrizioni/club-iscrizione/${clubId}/${competizioneId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero dell\'iscrizione del club:', error);
    throw error;
  }
};

// Funzione per caricare i documenti dell'iscrizione del club
export const uploadClubRegistrationDocuments = async (clubId, competizioneId, certificatiMedici, autorizzazioni) => {
  try {
    const formData = new FormData();
    formData.append('clubId', clubId);
    formData.append('competizioneId', competizioneId);
    formData.append('certificatiMedici', certificatiMedici);
    formData.append('autorizzazioni', autorizzazioni);

    const response = await axios.post('/iscrizioni/club-iscrizione/documenti', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento dei documenti:', error);
    throw error;
  }
};

// Funzione per confermare l'iscrizione del club (dopo l'upload dei documenti)
export const confirmClubRegistrationFinal = async (clubId, competizioneId) => {
  try {
    const response = await axios.post('/iscrizioni/club-iscrizione/conferma', { clubId, competizioneId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la conferma dell\'iscrizione del club:', error);
    throw error;
  }
};

// Funzione per scaricare un documento dell'iscrizione del club
export const downloadClubRegistrationDocument = async (clubId, competizioneId, tipoDocumento) => {
  try {
    const response = await axios.get(
      `/iscrizioni/club-iscrizione/${clubId}/${competizioneId}/documento/${tipoDocumento}`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error('Errore durante il download del documento:', error);
    throw error;
  }
};

// Funzione per modificare l'iscrizione del club
export const editClubRegistration = async (clubId, competizioneId) => {
  try {
    const response = await axios.post('/iscrizioni/club-iscrizione/modifica', { clubId, competizioneId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la modifica dell\'iscrizione del club:', error);
    throw error;
  }
};