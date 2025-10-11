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
