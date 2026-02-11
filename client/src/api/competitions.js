import axios from './axios';

// Carica tutte le competizioni (per admin)
export const loadAllCompetitions = async (states = []) => {
  try {
    const params = new URLSearchParams();
    if (states.length > 0) {
      states.forEach(state => params.append('stati', state));
    }
    const response = await axios.get('/competizioni', { params });
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento delle competizioni:', error);
    throw error;
  }
};

// Ottiene i dettagli di una competizione specifica (per admin)
export const getCompetitionDetails = async (id) => {
    try {
        const response = await axios.get(`/competizioni/${id}`);
        return response.data;
    } catch (error) {
        console.error('Errore nel caricamento dei dettagli della competizione:', error);
        throw error;
    }
};

// Ottiene le categorie di una competizione specifica
export const loadCompetitionCategories = async (competitionId) => {
  try {
    const response = await axios.get(`/competizioni/${competitionId}/tipocategorie`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle categorie:', error);
    throw error;
  }
};


// Ottiene il riepilogo costi dettagliato per una competizione e club
export const getClubCompetitionRegistrationSummary = async (competitionId, clubId) => {
  try {
    const response = await axios.get(`/competizioni/${competitionId}/riepilogo-iscrizione?clubId=${clubId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento del riepilogo costi:', error);
    throw error;
  }
};

// Ottiene le competizioni filtrate per tipologia
export const loadCompetitionsByTipologia = async (tipologiaId) => {
  try {
    const response = await axios.get(`/competizioni/tipologia/${tipologiaId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle competizioni per tipologia:', error);
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

// Scarica il report Excel degli atleti iscritti a una competizione
export const downloadExcelRegisteredAthletes = async (competitionId) => {
  try {
    const response = await axios.get(`/competizioni/${competitionId}/export-reg-athletes`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante il download del report Excel:', error);
    throw error;
  }
};

// Nota: Le funzioni di upload/download/delete file sono state migrate al file documents.js
// Usare uploadDocumento, downloadDocumento, deleteDocumento da './documents'
// Esempi:
// - Upload circolare: uploadDocumento(file, 'circolare_gara', competizioneId, 'competizione')
// - Upload locandina: uploadDocumento(file, 'locandina_competizione', competizioneId, 'competizione')
// - Upload file extra 1: uploadDocumento(file, 'file_extra1_competizione', competizioneId, 'competizione')
// - Upload file extra 2: uploadDocumento(file, 'file_extra2_competizione', competizioneId, 'competizione')
// - Download: downloadDocumento(documentoId)
// - Delete: deleteDocumento(documentoId, entitaId, entitaTipo, tipoDocumento)
