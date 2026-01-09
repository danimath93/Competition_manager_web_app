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
