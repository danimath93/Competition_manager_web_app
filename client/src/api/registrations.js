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

// Funzione per modificare le iscrizioni di un atleta
export const editAthleteRegistrations = async (athleteId, competitionId, editData) => {
  try {
    const response = await axios.post('/iscrizioni/atleta/modifica', { athleteId, competitionId, editData });
    return response.data;
  } catch (error) {
    console.error('Errore durante la modifica delle iscrizioni dell\'atleta:', error);
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

// Funzione per ottenere tutte le iscrizioni dei club per una competizione
export const getClubRegistrationsByCompetition = async (competizioneId) => {
  try {
    const response = await axios.get(`/iscrizioni/club-iscrizione/competizione/${competizioneId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero delle iscrizioni dei club:', error);
    throw error;
  }
};

// Funzione per caricare i documenti dell'iscrizione del club (conferma presidente e bonifico)
export const uploadClubRegistrationDocuments = async (clubId, competizioneId, confermaPresidente, bonifico) => {
  try {
    const formData = new FormData();
    formData.append('clubId', clubId);
    formData.append('competizioneId', competizioneId);
    if (confermaPresidente) {
      formData.append('confermaPresidente', confermaPresidente);
    }
    if (bonifico) {
      formData.append('bonifico', bonifico);
    }

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

// Funzione per scaricare il riepilogo delle iscrizioni di un club in una competizione
export const downloadClubRegistrationSummary = async (clubId, competizioneId) => {
  try {
    const response = await axios.get(`/iscrizioni/club-iscrizione/riepilogo/${clubId}/${competizioneId}`, {
      responseType: 'blob'
    });

    // Crea un URL blob e trigger il download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Riepilogo_Iscrizione_${clubId}_${competizioneId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Errore durante il download del riepilogo delle iscrizioni:', error);
    throw error;
  }
};

export const toggleVerificaIscrizioneClub = async (competizioneId, clubId) => {
  try {
    const response = await axios.post('/iscrizioni/club-iscrizione/verifica', { competizioneId, clubId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la verifica dell\'iscrizione del club:', error);
    throw error;
  }
};

export const toggleVerificaIscrizioneAtleta = async (competizioneId, atletaId) => {
  try {
    const response = await axios.post('/iscrizioni/atleta/verifica', { atletaId, competizioneId });
    return response.data;
  } catch (error) {
    console.error('Errore durante la verifica dell\'iscrizione dell\'atleta:', error);
    throw error;
  }
};

// ============ COSTI ISCRIZIONE ============

// Funzione per ottenere i costi totali per un club in una competizione
export const getClubRegistrationCosts = async (clubId, competizioneId) => {
  try {
    const response = await axios.get(`/iscrizioni/costs/${clubId}/${competizioneId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero dei costi:', error);
    throw error;
  }
};