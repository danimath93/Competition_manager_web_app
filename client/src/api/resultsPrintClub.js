import axios from './axios';

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
