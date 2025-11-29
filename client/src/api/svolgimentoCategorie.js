import axios from './axios';

// Avvia lo svolgimento di una categoria (idempotente)
export const startSvolgimentoCategoria = async ({ categoriaId, competizioneId, letteraEstratta }) => {
  try {
    const response = await axios.post('/svolgimento-categorie/start', {
      categoriaId,
      competizioneId,
      letteraEstratta
    });
    return response.data;
  } catch (error) {
    console.error('Errore avvio svolgimento categoria:', error);
    throw error;
  }
};

// Ottieni dati svolgimento categoria
export const getSvolgimentoCategoria = async (svolgimentoId) => {
  try {
    const response = await axios.get(`/svolgimento-categorie/${svolgimentoId}`);
    return response.data;
  } catch (error) {
    console.error('Errore get svolgimento categoria:', error);
    throw error;
  }
};

// Ottieni atleti snapshot
export const getSvolgimentoCategoriaAtleti = async (svolgimentoId) => {
  try {
    const response = await axios.get(`/svolgimento-categorie/${svolgimentoId}/atleti`);
    return response.data;
  } catch (error) {
    console.error('Errore get atleti svolgimento:', error);
    throw error;
  }
};

// Autosave svolgimento categoria
export const patchSvolgimentoCategoria = async (svolgimentoId, data) => {
  try {
    const response = await axios.patch(`/svolgimento-categorie/${svolgimentoId}`, data);
    return response.data;
  } catch (error) {
    console.error('Errore patch svolgimento categoria:', error);
    throw error;
  }
};
/*
export const startSvolgimento = async (payload) => {
  const res = await axios.post('/svolgimento-categorie/start', payload);
  return res.data;
};*/

export const getSvolgimentiByCompetizione = async (competizioneId) => {
  const res = await axios.get(`/svolgimento-categorie/by-competizione/${competizioneId}`);
  return res.data;
};