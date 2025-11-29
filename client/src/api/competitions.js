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
export const getCompetitionCostSummary = async (clubId, competitionId) => {
  try {
    const response = await axios.get(`/competizioni/${competitionId}/riepilogo-costi?clubId=${clubId}`);
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

// Upload file per una competizione
export const uploadCompetitionFiles = async (id, files) => {
  try {
    const formData = new FormData();
    
    if (files.circolareGara) {
      formData.append('circolareGara', files.circolareGara);
    }
    if (files.fileExtra1) {
      formData.append('fileExtra1', files.fileExtra1);
    }
    if (files.fileExtra2) {
      formData.append('fileExtra2', files.fileExtra2);
    }

    const response = await axios.post(`/competizioni/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'upload dei file:', error);
    throw error;
  }
};

// Download file di una competizione
export const downloadCompetitionFile = async (id, fileType) => {
  try {
    let fileInfo = null;
    const response = await axios.get(`/competizioni/${id}/files/${fileType}`, {
      responseType: 'blob',
    });
    
    // Determina il Content-Type e crea un Blob del tipo scelto
    let contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Determina il nome del file
    let filename = 'download';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Errore durante il download del file:', error);
    throw error;
  }
};

// Elimina file di una competizione
export const deleteCompetitionFile = async (id, fileType) => {
  try {
    const response = await axios.delete(`/competizioni/${id}/files/${fileType}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'eliminazione del file:', error);
    throw error;
  }
};

export const getCompetizioneLetter = async (competizioneId) => {
  const res = await axios.get(`/competizioni/${competizioneId}/lettera`);
  return res.data;
};