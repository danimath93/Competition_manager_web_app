import axios from './axios';

// Genera categorie automaticamente
export const generateCategories = async (competizioneId, options) => {
  try {
    const response = await axios.post(`/categorie/competizioni/${competizioneId}/generate`, options);
    return response.data;
  } catch (error) {
    console.error('Errore nella generazione delle categorie:', error);
    throw error;
  }
};

// Salva le categorie sul database
export const saveCategories = async (competizioneId, data) => {
  try {
    const response = await axios.post(`/categorie/competizioni/${competizioneId}/save`, data);
    return response.data;
  } catch (error) {
    console.error('Errore nel salvataggio delle categorie:', error);
    throw error;
  }
};

// Ottieni le categorie di una competizione
export const getCategoriesByCompetizione = async (competizioneId) => {
  try {
    const response = await axios.get(`/categorie/competizioni/${competizioneId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle categorie:', error);
    throw error;
  }
};

// Ottieni le categorie di una competizione filtrate per club
export const getCategoriesByClub = async (competizioneId, clubId) => {
  try {
    const response = await axios.get(`/categorie/competizioni/${competizioneId}/club/${clubId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle categorie del club:', error);
    throw error;
  }
};

// Aggiorna una categoria
export const updateCategoria = async (id, data) => {
  try {
    const response = await axios.put(`/categorie/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento della categoria:', error);
    throw error;
  }
};

// Elimina una categoria
export const deleteCategoria = async (id) => {
  try {
    const response = await axios.delete(`/categorie/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'eliminazione della categoria:', error);
    throw error;
  }
};

// Elimina tutte le categorie di una competizione
export const deleteCategoriesByCompetition = async (competitionId) => {
  try {
    const response = await axios.delete(`/categorie/${competitionId}/categorie`);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'eliminazione delle categorie della competizione:', error);
    throw error;
  }
};

// Sposta atleti tra categorie
export const moveAtleti = async (atletiIds, targetCategoriaId) => {
  try {
    const response = await axios.post('/categorie/move-atleti', {
      atletiIds,
      targetCategoriaId
    });
    return response.data;
  } catch (error) {
    console.error('Errore nello spostamento degli atleti:', error);
    throw error;
  }
};

// Unisci due categorie
export const mergeCategorie = async (categoria1Id, categoria2Id, nuovoNome) => {
  try {
    const response = await axios.post('/categorie/merge', {
      categoria1Id,
      categoria2Id,
      nuovoNome
    });
    return response.data;
  } catch (error) {
    console.error('Errore nell\'unione delle categorie:', error);
    throw error;
  }
};

// Dividi una categoria
export const splitCategoria = async (categoriaId, atleti1, atleti2, nomeCategoria1, nomeCategoria2) => {
  try {
    const response = await axios.post('/categorie/split', {
      categoriaId,
      atleti1,
      atleti2,
      nomeCategoria1,
      nomeCategoria2
    });
    return response.data;
  } catch (error) {
    console.error('Errore nella divisione della categoria:', error);
    throw error;
  }
};

// Ottieni i gruppi età disponibili
export const getGruppiEta = async () => {
  try {
    const response = await axios.get('/config/gruppi-eta');
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei gruppi età:', error);
    throw error;
  }
};

// Stampa categorie in PDF
export const printCategories = async (competizioneId) => {
  try {
    const response = await axios.get(`/competizioni/${competizioneId}/print-categories`, {
      responseType: 'blob'
    });
    
    // Crea un URL blob e trigger il download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `categorie-${competizioneId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Errore nella stampa delle categorie:', error);
    throw error;
  }
};

// Salva la lettera estratta per una competizione
export const saveExtractedLetter = async (competizioneId, lettera) => {
  try {
    const response = await axios.post(`/categorie/competizioni/${competizioneId}/lettera`, { lettera });
    return response.data;
  } catch (error) {
    console.error('Errore nel salvataggio della lettera estratta:', error);
    throw error;
  }
};

// Recupera la lettera estratta per una competizione
export const getExtractedLetter = async (competizioneId) => {
  try {
    const response = await axios.get(`/categorie/competizioni/${competizioneId}/lettera`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero della lettera estratta:', error);
    throw error;
  }
};

// Salva lo svolgimento di una categoria
export const saveCategoryExecution = async (categoriaId, data) => {
  try {
    const response = await axios.post(`/categorie/${categoriaId}/svolgimento`, data);
    return response.data;
  } catch (error) {
    console.error('Errore nel salvataggio dello svolgimento categoria:', error);
    throw error;
  }
};

// Recupera lo svolgimento di una categoria
export const getCategoryExecution = async (categoriaId) => {
  try {
    const response = await axios.get(`/categorie/${categoriaId}/svolgimento`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dello svolgimento categoria:', error);
    throw error;
  }
};
