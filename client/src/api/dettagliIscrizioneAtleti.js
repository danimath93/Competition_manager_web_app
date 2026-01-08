import axios from './axios';

// Crea nuovo dettaglio iscrizione atleta
export const createDettaglioIscrizioneAtleta = async (data) => {
  const res = await axios.post('/dettagli-iscrizione-atleti', data);
  return res.data;
};

// Ottieni tutti i dettagli (con filtri opzionali)
export const loadDettagliIscrizioneAtleti = async (params = {}) => {
  const res = await axios.get('/dettagli-iscrizione-atleti', { params });
  return res.data;
};

// Ottieni dettaglio per ID
export const getDettaglioIscrizioneAtleta = async (id) => {
  const res = await axios.get(`/dettagli-iscrizione-atleti/${id}`);
  return res.data;
};

// Aggiorna dettaglio
export const updateDettaglioIscrizioneAtleta = async (id, data) => {
  const res = await axios.put(`/dettagli-iscrizione-atleti/${id}`, data);
  return res.data;
};

// Elimina dettaglio
export const deleteDettaglioIscrizioneAtleta = async (id) => {
  await axios.delete(`/dettagli-iscrizione-atleti/${id}`);
};
