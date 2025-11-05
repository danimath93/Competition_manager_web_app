import axios from './axios';

// Funzione per ottenere tutti i tipi di competizione con le loro categorie
export const loadCompetitionTypes = async () => {
  try {
    const response = await axios.get('/config/tipi-competizione');
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento dei tipi di competizione:', error);
    throw error;
  }
};

// Funzione per ottenere un tipo di competizione specifico
export const loadCompetitionTypeById = async (id) => {
  try {
    const response = await axios.get(`/config/tipi-competizione/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento del tipo di competizione:', error);
    throw error;
  }
};

// Funzione per ottenere le categorie di un tipo di competizione specifico
export const loadCategoriesByCompetitionType = async (tipoCompetizioneId) => {
  try {
    const response = await axios.get(`/config/tipi-competizione/${tipoCompetizioneId}/categorie`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle categorie per tipo:', error);
    throw error;
  }
};

// Funzione per ottenere tutti i tipi di categoria
export const loadAllCategoryTypes = async () => {
  try {
    const response = await axios.get('/config/tipi-categoria');
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento dei tipi di categoria:', error);
    throw error;
  }
};

// Funzione per ottenere un tipo categoria specifico
export const loadCategoryTypeById = async (id) => {
  try {
    const response = await axios.get(`/config/tipi-categoria/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento del tipo categoria:', error);
    throw error;
  }
};

// Funzione per ottenere tutti i tipi atleta
export const loadAthleteTypes = async () => {
  try {
    const response = await axios.get('/config/tipi-atleta');
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento dei tipi atleta:', error);
    throw error;
  }
};

// Funzione per ottenere un tipo atleta specifico
export const loadAthleteTypeById = async (id) => {
  try {
    const response = await axios.get(`/config/tipi-atleta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento del tipo atleta:', error);
    throw error;
  }
};

// Funzione per ottenere tutte le esperienze
export const loadExperiences = async () => {
  try {
    const response = await axios.get('/config/esperienze');
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle esperienze:', error);
    throw error;
  }
};

// Funzione per ottenere un'esperienza specifica
export const loadExperienceById = async (id) => {
  try {
    const response = await axios.get(`/config/esperienze/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento dell\'esperienza:', error);
    throw error;
  }
};

// Funzione per ottenere le esperienze per tipo atleta
export const loadExperiencesByAthleteType = async (tipoAtletaId) => {
  try {
    const response = await axios.get(`/config/tipi-atleta/${tipoAtletaId}/esperienze`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle esperienze per tipo atleta:', error);
    throw error;
  }
};
