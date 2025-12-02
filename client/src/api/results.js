import axios from './axios';

// Classifica atleti per fasce di età e genere
export const getAtletiResults = async () => {
  const res = await axios.get('/results/atleti');
  return res.data;
};

// Classifica club
export const getClubResults = async () => {
  const res = await axios.get('/results/club');
  return res.data;
};

// Dettaglio medaglie per club
export const getClubMedalsDetails = async (clubId) => {
  const res = await axios.get(`/results/club/${clubId}`);
  return res.data;
};
