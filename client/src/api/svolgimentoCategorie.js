import axios from './axios';

export const startSvolgimentoCategoria = async ({ categoriaId, competizioneId }) => {
  try {
    const response = await axios.post('/svolgimento-categorie/start', {
      categoriaId,
      competizioneId
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

// Ottieni dati svolgimento categoria tramite categoriaId
export const getSvolgimentoByCategoriaId = async (categoriaId) => {
  try {
    const response = await axios.get(`/svolgimento-categorie/by-categoria/${categoriaId}`);
    return response.data;
  } catch (error) {
    console.error('Errore get svolgimento per categoriaId:', error);
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

export const getSvolgimentiByCompetizione = async (competizioneId) => {
  const res = await axios.get(`/svolgimento-categorie/by-competizione/${competizioneId}`);
  return res.data;
};

// genera tabellone lato server (se vuoi che lo faccia server-side)
export const postGenerateTabellone = async (svolgimentoId) => {
  const res = await axios.post(`/svolgimento-categorie/${svolgimentoId}/generate-tabellone`);
  return res.data;
};

// imposta vincitore match
export const postSetMatchWinner = async (svolgimentoId, matchId, winnerAtletaId) => {
  const res = await axios.post(`/svolgimento-categorie/${svolgimentoId}/match/${encodeURIComponent(matchId)}/winner`, {
    winnerAtletaId
  });
  return res.data;
};

// salvataggio tabellone completo
export const putSaveTabellone = async (svolgimentoId, tabellone) => {
  const res = await axios.put(`/svolgimento-categorie/${svolgimentoId}/tabellone`, { tabellone });
  return res.data;
};
