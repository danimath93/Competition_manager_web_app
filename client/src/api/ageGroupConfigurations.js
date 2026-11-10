import axios from './axios';

// Ottieni le configurazioni fasce età del club e quelle di default (clubId opzionale, solo admin)
export const loadAgeGroupConfigurations = async (clubId = null) => {
  try {
    const response = await axios.get('/age-group-configurations', {
      params: clubId ? { clubId } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento delle configurazioni fasce età:', error);
    throw error;
  }
};

// Ottieni una configurazione fasce età per ID
export const loadAgeGroupConfigurationById = async (id) => {
  try {
    const response = await axios.get(`/age-group-configurations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il caricamento della configurazione fasce età:', error);
    throw error;
  }
};

// Crea una configurazione fasce età per il club: { name, description, config, clubId? }
export const createAgeGroupConfiguration = async (data) => {
  try {
    const response = await axios.post('/age-group-configurations', data);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione della configurazione fasce età:', error);
    throw error;
  }
};

// Copia una configurazione (es. default) nel club: { name?, description?, clubId? }
export const copyAgeGroupConfiguration = async (id, data = {}) => {
  try {
    const response = await axios.post(`/age-group-configurations/${id}/copy`, data);
    return response.data;
  } catch (error) {
    console.error('Errore durante la copia della configurazione fasce età:', error);
    throw error;
  }
};

// Aggiorna una configurazione fasce età del club: { name?, description?, config? }
export const updateAgeGroupConfiguration = async (id, data) => {
  try {
    const response = await axios.put(`/age-group-configurations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della configurazione fasce età:', error);
    throw error;
  }
};

// Elimina una configurazione fasce età del club
export const deleteAgeGroupConfiguration = async (id) => {
  try {
    const response = await axios.delete(`/age-group-configurations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'eliminazione della configurazione fasce età:', error);
    throw error;
  }
};
