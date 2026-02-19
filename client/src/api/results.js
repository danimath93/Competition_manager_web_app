import axios from './axios';

// Classifica atleti per fasce di età e genere
export const getAtletiResults = async (competitionId) => {
  const params = {};
  if (competitionId) params.competitionId = competitionId;
  const res = await axios.get('/results/atleti', { params });
  return res.data;
};

// Classifica club
export const getClubResults = async (competitionId) => {
  const params = {};
  if (competitionId) params.competitionId = competitionId;
  const res = await axios.get('/results/club', { params });
  return res.data;
};

// Dettaglio medaglie per club
export const getClubMedalsDetails = async (clubId, competitionId) => {
  const params = {};
  if (competitionId) params.competitionId = competitionId;
  const res = await axios.get(`/results/club/${clubId}`, { params });
  return res.data;
};

// Download PDF delle classifiche finali per una competizione
export const printResults = async (competizioneId) => {
  try {
    const response = await axios.get(`/results/competizioni/${competizioneId}/print-results`, {
      responseType: 'blob'
    });
    // Crea un URL blob e trigger il download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `classifiche-${competizioneId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Errore nella stampa delle classifiche:', error);
    throw error;
  }
};

// Download PDF classifica club per una competizione
export const printClubResults = async (competizioneId) => {
  try {
    const response = await axios.get(`/results/competizioni/${competizioneId}/print-club-results`, {
      responseType: 'blob'
    });
    // Crea un URL blob e trigger il download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `classifica-club-${competizioneId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Errore nella stampa della classifica club:', error);
    throw error;
  }
};
