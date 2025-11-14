import axios from './axios';

export const loadAllClubs = async () => {
  try {
    const response = await axios.get('/clubs');
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento dei club:', error);
    throw error;
  }
};

export const loadClubByID = async (clubId) => {
  try {
    const response = await axios.get(`/clubs/${clubId}/`);
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento del club:', error);
    throw error;
  }
};

// Funzione per creare un nuovo club
export const createClub = async (clubData) => {
  try {
    const response = await axios.post('/clubs/', clubData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la creazione dell\'club:', error);
    throw error;
  }
};

// Funzione per aggiornare un club esistente
export const updateClub = async (clubId, clubData) => {
  try {
    const response = await axios.put(`/clubs/${clubId}/`, clubData);
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'club:', error);
    throw error;
  }
};

// Funzione per eliminare un club
export const deleteClub = async (clubId) => {
  try {
    await axios.delete(`/clubs/${clubId}/`);
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'club:', error);
    throw error;
  }
};

export const checkClubExists = async (codiceFiscale, partitaIva) => {
  try {
    console.log('Controllo esistenza club con CF:', codiceFiscale, 'e P.IVA:', partitaIva);
    const response = await axios.post('/clubs/check', { codiceFiscale, partitaIva });
    return response.data;
  } catch (error) {
    console.error('Errore durante la verifica dell\'club:', error);
    throw error;
  }
};

export const uploadLogoClub = async (clubId, file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axios.put(`/clubs/${clubId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante l\'upload del logo:', error);
    throw error;
  }
};


