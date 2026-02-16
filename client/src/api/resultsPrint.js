import axios from './axios';

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
