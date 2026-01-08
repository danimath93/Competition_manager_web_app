import axios from './axios';

/**
 * Upload di un documento
 * @param {File} file - File da caricare
 * @param {string} tipoDocumento - Tipo documento (logo_club, circolare_gara, etc.)
 * @param {number} entitaId - ID dell'entità di riferimento
 * @param {string} entitaTipo - Tipo entità (club, competizione, iscrizione_club)
 * @param {string} descrizione - Descrizione opzionale
 */
export const uploadDocumento = async (file, tipoDocumento, entitaId, entitaTipo, descrizione = null) => {
  try {
    const formData = new FormData();
    formData.append('documento', file);
    formData.append('tipoDocumento', tipoDocumento);
    formData.append('entitaId', entitaId);
    formData.append('entitaTipo', entitaTipo);
    if (descrizione) {
      formData.append('descrizione', descrizione);
    }

    const response = await axios.post('/documenti/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Errore durante l\'upload del documento:', error);
    throw error;
  }
};

/**
 * Download di un documento
 * @param {number} documentoId - ID del documento
 */
export const downloadDocumento = async (documentoId) => {
  try {
    const response = await axios.get(`/documenti/${documentoId}/download`, {
      responseType: 'blob',
    });

    // Determina il Content-Type e crea un Blob
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Determina il nome del file
    let filename = 'download';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Errore durante il download del documento:', error);
    throw error;
  }
};

/**
 * Ottieni URL per il download di un documento
 * @param {number} documentoId - ID del documento
 */
export const getDocumentoUrl = (documentoId) => {
  return `/api/documenti/${documentoId}/download`;
};

/**
 * Ottieni informazioni su un documento (senza BLOB)
 * @param {number} documentoId - ID del documento
 */
export const getDocumentoInfo = async (documentoId) => {
  try {
    const response = await axios.get(`/documenti/${documentoId}`);
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero delle informazioni del documento:', error);
    throw error;
  }
};

/**
 * Elimina un documento
 * @param {number} documentoId - ID del documento
 * @param {number} entitaId - ID dell'entità di riferimento
 * @param {string} entitaTipo - Tipo entità (club, competizione, iscrizione_club)
 * @param {string} tipoDocumento - Tipo documento
 */
export const deleteDocumento = async (documentoId, entitaId, entitaTipo, tipoDocumento) => {
  try {
    await axios.delete(`/documenti/${documentoId}`, {
      data: {
        entitaId,
        entitaTipo,
        tipoDocumento
      }
    });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del documento:', error);
    throw error;
  }
};
