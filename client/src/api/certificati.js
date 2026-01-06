import axios from './axios';

// Upload certificato medico per un atleta
export const uploadCertificato = async (atletaId, file) => {
  const formData = new FormData();
  formData.append('certificato', file);

  const response = await axios.post(`/certificati/atleta/${atletaId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Download certificato medico di un atleta
export const downloadCertificato = async (atletaId) => {
  const response = await axios.get(`/certificati/atleta/${atletaId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

// Ottieni informazioni sul certificato (senza scaricare il file)
export const getCertificatoInfo = async (atletaId) => {
  const response = await axios.get(`/certificati/atleta/${atletaId}/info`);
  return response.data;
};

// Elimina certificato medico di un atleta
export const deleteCertificato = async (atletaId) => {
  const response = await axios.delete(`/certificati/atleta/${atletaId}`);
  return response.data;
};

// Ottieni stato certificato (per visualizzazione icone)
export const getStatoCertificato = (scadenzaCertificato, hasCertificato) => {
  if (!hasCertificato) {
    return {
      stato: 'assente',
      colore: 'gray',
      icona: 'file-x',
      tooltip: 'Certificato non caricato'
    };
  }

  if (!scadenzaCertificato) {
    return {
      stato: 'presente',
      colore: 'blue',
      icona: 'file-text',
      tooltip: 'Certificato presente (senza data di scadenza)'
    };
  }

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const scadenza = new Date(scadenzaCertificato);
  scadenza.setHours(0, 0, 0, 0);
  
  const differenzaGiorni = Math.floor((scadenza - oggi) / (1000 * 60 * 60 * 24));

  if (differenzaGiorni < 0) {
    return {
      stato: 'scaduto',
      colore: 'red',
      icona: 'file-x',
      tooltip: `Certificato scaduto il ${new Date(scadenzaCertificato).toLocaleDateString('it-IT')}`
    };
  }

  if (differenzaGiorni <= 30) {
    return {
      stato: 'in_scadenza',
      colore: 'orange',
      icona: 'file-warning',
      tooltip: `Certificato in scadenza il ${new Date(scadenzaCertificato).toLocaleDateString('it-IT')} (${differenzaGiorni} giorni)`
    };
  }

  return {
    stato: 'valido',
    colore: 'green',
    icona: 'file-check',
    tooltip: `Certificato valido fino al ${new Date(scadenzaCertificato).toLocaleDateString('it-IT')}`
  };
};
