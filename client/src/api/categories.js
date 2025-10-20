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
